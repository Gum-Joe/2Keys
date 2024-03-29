/**
 * @license
 * Copyright 2020 Kishan Sambhi
 *
 * This file is part of 2Keys.
 *
 * 2Keys is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 2Keys is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * Controls the management of 2Keys packages & add-ons (add-ons come in package, specifically npm packages)
 * @packageDocumentation
 */
import mkdirp from "mkdirp";
import npm from "npm";
import { open as openDB, Database, Statement } from "sqlite";
import sqlite3 from "sqlite3";
import { v4 as uuidv4 } from "uuid";
import { promises as fs, constants as fsconstants } from "fs";
import { join } from "path";
import { Logger, CodedError } from "@twokeys/core";
import { DEFAULT_REGISTRY_ROOT_PACKAGE_JSON, REGISTRY_FILE_NAME, CREATE_REGISTRY_DB_QUERY, REGISTRY_TABLE_NAME, REGISTRY_MODULE_FOLDER } from "./util/constants";
import { Package, PackageInDB, TWOKEYS_ADDON_TYPES_ARRAY, TwokeysPackageInfo, ValidatorReturn, TWOKEYS_ADDON_TYPES, TWOKEYS_ADDON_TYPE_EXECUTOR, TWOKEYS_ADDON_TYPE_DETECTOR, TWOKEYS_ADDON_TYPE_SINGLE } from "./util/interfaces";
import { AddOnModulesCollection, TaskFunction, BaseAddon } from "./module-interfaces";
import TwoKeys, { TwoKeysPropertiesForAddons } from "./module-interfaces/twokeys";
import { LoggerArgs } from "@twokeys/core/lib/interfaces";
import * as errorCodes from "./util/error-codes";

/**
 * Options for add-on registry constructor
 */
interface AddOnsRegistryOptions {
	/** Absolute path of registry database (a sqlite3 .db file) */
	dbFilePath?: string;
	/** Custom twokeys class to use when loading modules - please provide the contructor! */
	TwoKeys?: typeof TwoKeys;
	/** Custom logger to use - please provide the contructor! */
	Logger?: typeof Logger;
}

/**
 * Options for package management functions
 */
interface ManagerOptions {
	/** Local package or not? */
	local?: boolean;
	/** Force npm install & adding to registry */
	force?: boolean;
	/** Semver version to install */
	version?: string;
	/** HACK: Allow using linked packages.  Please remove in final version */
	useLink?: boolean;
}

/**
 * Options when adding a package to registry
 */
interface AddPackageOptions {
	force?: boolean;
	/** Update package in place if overlap found & entries of it = 1 */
	update?: boolean;
}

/** Return type for function {@link AddOnsRegistry.parsePackageFromDB} that parses DB entries to a {@link Package} */
type ParseDBReturn = ValidatorReturn & { entry?: Package };

/** Return type for function {@link AddOnsRegistry.getPackageFromDB} that parses DB entries to a {@link Package} */
type GetPackageReturn = ValidatorReturn & { results?: Package[] };

/**
 * Represents a loaded add-on,
 * basically retrieving the correct add-on exports defintion from {@link AddOnModulesCollection}
 * & adding a {@link Package} object so we can get info about the package the add-on is loaded from
 * @param package Package object of add-on that is loaded
 * @param call Function to run an add-ons task function
 */
export type LoadedAddOn<AddOnsType extends (TWOKEYS_ADDON_TYPES & string)> = AddOnModulesCollection[AddOnsType] & BaseAddon<AddOnsType> & {
	/** Package object of add-on that is loaded */
	package: Package;
	/**
	 * Function to run an add-on {@link TaskFunction}
	 * @template T Config type
	 * @template U Return type (excluding promise wrapper) of the function
	 * @returns The Promise from the function
	 */
	call: <T, U>(fn: TaskFunction<T, U, AddOnsType>, config: T) => U;
	/** twokeys class */
	twokeys: TwoKeys<AddOnsType>;
	/** Properties for {@link TwoKeys.properties} */
	properties: TwoKeysPropertiesForAddons<AddOnsType>;
};

// TODO: Before and after hooks for registry
/**
 * Registry class.
 * Handles management of add-ons
 * How a registry works:
 * - In the root there are two files `package.json` and `twokeys-registry.db` and a `node_modules` directory
 * 	- `package.json` is a normal npm `package.json` and stores a list of dependencies, which is the list of installed add-ons (packages)]
 * 	- `twokeys-registry.db` is an easy access DB with information about the add-ons so we don't have to load all the package.json of the add-ons.  See {@link Package} for contents
 * 	- `node_modules` contains the add-ons themselves
 */
export default class AddOnsRegistry {

	protected directory: string;
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// Is initalised by this.initDB()
	protected registry!: Database;
	public readonly registryDBFilePath: string;
	/** Path to root of registry */
	protected registryModulesPath: string;
	/** TwoKeys class to use in {@link TaskFunction}s, when loading add-ons */
	protected TwoKeys: typeof TwoKeys = TwoKeys;
	/** Logger */
	protected logger = new Logger({
		name: "add-ons:registry",
	});
	/** Constrcutor for the logger (has to be private) */
	private LoggerConstructor: typeof Logger = Logger;

	/**
	 * Initalises a new registry class for the registry at `dir`
	 * @param dir Directory with root package.JSON in
	 */
	constructor(dir: string, options?: AddOnsRegistryOptions) {
		this.directory = dir;
		this.registryDBFilePath = options?.dbFilePath || join(this.directory, REGISTRY_FILE_NAME);
		this.registryModulesPath = join(this.directory, REGISTRY_MODULE_FOLDER);
		if (typeof options?.TwoKeys !== "undefined" && options.TwoKeys) {
			this.TwoKeys = options.TwoKeys;
		}
		if (typeof options?.Logger !== "undefined" && options.Logger) {
			this.logger = new options.Logger({
				name: "add-ons:registry",
			});
			this.LoggerConstructor = options.Logger;
		}
		this.logger.debug(`New registry class created for ${dir}`);
	}

	// Load functions
	/**
	 * Generates a logger for an add-on.
	 * 
	 * It does this by creating an child class of {@link AddOnsRegistry.LoggerConstructor} that appends `add-on:addonName:` to the beginning of the prefix for the logger.
	 * 
	 * This means:
	 * - When an add-on function logs, it has the prefix `add-on:addonName::` (colon there because `::` looks better than `:`; the extra colon is provided by {@link TwoKeys})
	 * - When an add-on use software or registry or other 2Keys function, the prefix is `add-on:addonName:software`, etc
	 */
	public static getLoggerForAddon(thePackage: Package, LoggerConstructor: typeof Logger): typeof Logger {
		return class extends LoggerConstructor {
			constructor(args: LoggerArgs) {
				super(args);
				this.args.name = `add-on:${thePackage.name}:${this.args.name}`;
			}
		};
	}
	
	/**
	 * Loads the entry points for an add-on type from a {@link Package} (so a package that has already been retrieved from DB).
	 * Also adds information about the add-on to the loaded module, in the `package` key (see {@link LoadedAddOn}).
	 * 
	 * **Important:** To call {@link TaskFunction}s in an add-on, use the .call() method in the returned boject (a {@link LoadedAddOn})
	 * @param packageToLoad Package object to load from, converted from {@link PackageInDB}
	 * @param typeOfAddOn SINGLE type to load
	 * @template AddOnsTypes Type of add-on to load; see {@link TWOKEYS_ADDON_TYPES}. Single one only.
	 * @returns A loaded add-on.  Use .call(config) to call a {@link TaskFunction}
	 */
	private async loadPackage<AddOnsType extends TWOKEYS_ADDON_TYPE_SINGLE>(packageToLoad: Package, typeOfAddOn: AddOnsType, propertiesForAddOn: TwoKeysPropertiesForAddons<AddOnsType>): Promise<LoadedAddOn<AddOnsType>> {
		try {
			this.logger.info(`Loading package ${packageToLoad.name}, type ${typeOfAddOn}...`);
			this.logger.debug(JSON.stringify(packageToLoad));
			if (typeof packageToLoad.entry[typeOfAddOn] !== "undefined") {
				const file: string = join(this.registryModulesPath, packageToLoad.name, (packageToLoad.entry[typeOfAddOn] as string));
				this.logger.debug(`Loading type ${typeOfAddOn} from file ${file}...`);
				// load
				const loaded: LoadedAddOn<AddOnsType> = await import(file);
				this.logger.debug("Type of add-on loaded.");
				// Add package object
				loaded.package = packageToLoad;
				// Add call function
				this.logger.debug("Adding twokeys class & call function");
				loaded.properties = propertiesForAddOn || {};
				loaded.twokeys = new this.TwoKeys<AddOnsType>(
					Object.assign(packageToLoad),
					this.registryDBFilePath,
					AddOnsRegistry.getLoggerForAddon(loaded.package, this.LoggerConstructor),
					loaded.properties
				);
				// Custom Logger to use

				loaded.call = <T, U>(fn: TaskFunction<T, U, AddOnsType>, config: T): U => {
					return fn(loaded.twokeys, config);
				};
				this.logger.info("Add-on loaded.");
				return loaded;
			} else {
				// Not found!
				this.logger.err(`Add-on of type ${typeOfAddOn} not in package (add-on) ${packageToLoad.name} entries!`);
				throw new Error(`Add-on of type ${typeOfAddOn} not in package (add-on) ${packageToLoad.name} entries!`);
			}
		} catch (err) {
			this.logger.err("Error loading add-on!");
			this.logger.err(`Full error message: ${err.message}`);
			if (err?.code === "MODULE_NOT_FOUND") {
				throw new CodedError(
					`Entry point for type ${typeOfAddOn} from add-on ${packageToLoad.name} not found!`,
					errorCodes.ADDON_LOAD_FAILURE + ":NOT_FOUND"
				);
			} else {
				throw new CodedError(`Error loading entry point for for type ${typeOfAddOn} from add-on ${packageToLoad.name}: ${err.message}`, `${errorCodes.ADDON_LOAD_FAILURE}${err.code ? ":" + err.code : ""}`);
			}
		}
	}
	/**
	 * Loads an add-on, getting add-on code for a given type, by querying DB
	 * @param packageName Name of package (add-on) to load
	 * @param typeOfAddOn SINGLE type to load
	 * @template AddOnsTypes Type of add-on to load; see {@link TWOKEYS_ADDON_TYPES}. Single one only.
	 */
	public async load<AddOnsType extends TWOKEYS_ADDON_TYPE_SINGLE>(packageName: string, typeOfAddOn: AddOnsType, propertiesForAddOn: TwoKeysPropertiesForAddons<AddOnsType>): Promise<LoadedAddOn<AddOnsType>> {
		this.logger.info(`Loading add-on ${packageName}...`);
		try {
			// Query DB for package
			const packagesResults = await this.getPackagesFromDB(packageName);
			if (!packagesResults.status) {
				this.logger.err("Error loading add-on from DB!");
				throw new CodedError(`Error loading add-on from DB: ${packagesResults.message || "See logs above"}`, errorCodes.ADDON_DB_LOAD_FAIL);
			} else if (typeof packagesResults.results === "undefined" || packagesResults.results.length < 1) {
				this.logger.err(`No add-ons were found by name ${packageName}!`);
				const err: any = new CodedError(`No add-ons were found by name ${packageName}!`, errorCodes.ADDON_NOT_IN_REGISTRY);
				throw err;
			} else if (packagesResults.results.length > 1) {
				this.logger.err("Error! Got back multiple add-ons!");
				this.logger.err("This means the registry DB may be corrupt.");
				this.logger.err("Please reindex the add-on DB in full.");
				throw new Error("Got back multiple add-ons! Registry DB may be corrupt!");
			} else {
				// Everything OK, so we can load
				return this.loadPackage<AddOnsType>(packagesResults.results[0], typeOfAddOn, propertiesForAddOn);
			}
		} catch (err) {
			this.logger.err("Error loading package!");
			throw err;
		}
	}

	/**
	 * Util function to create a loadAddonType function, e.g. `loadExecutor`
	 */
	public createLoaderForAddonType<AddOnType extends TWOKEYS_ADDON_TYPES & string>(addOnType: AddOnType) {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		return async (packageName: string, propertiesForAddOn: TwoKeysPropertiesForAddons<AddOnType>): Promise<LoadedAddOn<AddOnType>> => {
			return (await this.load<AddOnType>(packageName, addOnType, propertiesForAddOn));
		};
	}
	/** Loads an executor */
	public loadExecutor = this.createLoaderForAddonType(TWOKEYS_ADDON_TYPE_EXECUTOR);
	/** Loads an detector */
	public loadDetector = this.createLoaderForAddonType(TWOKEYS_ADDON_TYPE_DETECTOR);

	/**
	 * Loads all add-ons of a given type
	 * 
	 * NOTE: Is currently unable to load detectors as a client location is required. (see {@link DetectorTwoKeysProperties})
	 * @param typeOfAddOn Add-on type to load
	 * @template AddOnsTypes Type of add-on to load; see {@link TWOKEYS_ADDON_TYPES}. Single one only
	 */
	public async loadAllOfType<AddOnsType extends (TWOKEYS_ADDON_TYPES & string)>(typeOfAddOn: AddOnsType, properties: TwoKeysPropertiesForAddons = {}): Promise<{ [name: string]: LoadedAddOn<AddOnsType> }> {
		this.logger.info(`Loading all modules of type ${typeOfAddOn}...`);
		await this.initDB();
		if (typeOfAddOn === TWOKEYS_ADDON_TYPE_DETECTOR) {
			throw new Error("Can't do a load all for detectors becasue client location is unknown, and this is required for detectors");
		}
		this.logger.debug("Querying...");
		const addOnsList: Package[] = (await this.registry.all(`SELECT * FROM ${REGISTRY_TABLE_NAME} WHERE types LIKE ?`, `%${typeOfAddOn}%`)).map(value => {
			const res = this.parsePackageFromDB(value);
			if (!res.status || !res.entry) { throw new Error(res.message); }
			return res.entry;
		});
		this.logger.debug(JSON.stringify(addOnsList));
		const loadedAddOns: { [name: string]: LoadedAddOn<AddOnsType> } = {};
		const promiseLoaders = addOnsList.map(async addOn => loadedAddOns[addOn.name] = await this.loadPackage<AddOnsType>(
			addOn,
			typeOfAddOn,
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			properties
		));
		await Promise.all(promiseLoaders);
		return loadedAddOns;

	}

	// Package management operations
	/**
	 * Installs a new package (through {@link AddOnsRegistry.runNpmInstall}) AND adds it to the registry
	 * @param packageName Packe to install
	 * @param options Options
	 */
	public async install(packageName: string, options?: ManagerOptions): Promise<ValidatorReturn> {
		this.logger.info("Installing new package...");
		const packageString = options?.version ? packageName + "@" + options.version : packageName;
		this.logger.info(`Package: ${packageString}`);
		let npmCommand: keyof typeof npm["commands"] = "install";
		// HACK: Allow the use of locally installed npm link modules in a registry. Remove this for final release as it is a hack
		/* istanbul ignore next */
		if (options?.useLink) {
			this.logger.debug("Using link command.");
			npmCommand = "link";
		}
		await this.runNpm(packageString, npmCommand, options);
		this.logger.info("Adding package to registry...");
		// If local, get Name and use that
		let truePackageName = packageName; // packageName can be a string, hence this
		if (options?.local) {
			this.logger.debug("Local package.  Getting name...");
			const packageJSON = JSON.parse((await fs.readFile(join(packageName, "package.json"))).toString("utf8"));
			truePackageName = packageJSON.name;
		}
		// Add package
		const addPackageReturn = await this.addPackageToDB(truePackageName, options);
		// Error check
		if (!addPackageReturn.status) {
			this.logger.err("Error adding package to DB!");
			this.logger.err(addPackageReturn.message || "NO MESSAGE FOUND");
			this.logger.info("Please note: if you intended to install a non-2Keys package (i.e. just a normal npm package) npm has been ran and the package is installed.");
			return addPackageReturn;
			// throw new Error(addPackageReturn.message || "Unknown error adding package to DB!");
		}

		// Run install()
		// `addPackageToDB()` ensure that package is a valdi 2Keys package
		this.logger.info("Running package install functions...");
		this.logger.debug("Grabbing package info...");
		const packageInfo = await this.getPackagesFromDB(truePackageName);
		if (!packageInfo.status || !Object.prototype.hasOwnProperty.call(packageInfo, "results") || typeof packageInfo.results === "undefined") {
			this.logger.err("Error getting package from DB!");
			this.logger.err(packageInfo.message || "NO MESSAGE FOUND OR NO RESULTS ENTRY.");
			return packageInfo;
			// throw new Error(packageInfo.message || "Unknown error adding package to DB, or results entry was missing!");
		}
		// Length check
		/* istanbul ignore if */
		if (packageInfo.results.length < 1) {
			this.logger.err("Got back no packages when quering for the package we just installed.");
			this.logger.err("Something unexpected, perhaps impossible, has happened.");
			this.logger.err("It is recommended you reindex your registry.");
			this.logger.err("NOTE: If the package you were installing is non-2Keys (i.e. just a normal npm package), your package has been installed.");
			this.logger.err("However, you shouldn't be seeing this error message if so, as we should have already checked if the package has 2Keys metadata.");
			this.logger.err("Please file an issue for either of the above cases, since we think seeing this error message should be impossible.");
			throw new Error("Got back no packages when quering for the package we just installed.");
		}

		for (const addOn of packageInfo.results || []) {
			this.logger.debug(`Running install()s for ${addOn.name}.`);
			this.logger.debug("Loading scripts for each included add-on type ready for execution...");
			const loadedScript = await Promise.all(addOn.types.map(async addOnType => { return { loadedScript: await this.load(addOn.name, addOnType, {}), addOnType }; }));
			for (const script of loadedScript) {
				this.logger.info(`Running install() for add-on type ${script.addOnType}...`);
				if ("install" in script.loadedScript && typeof script.loadedScript.install == "function") {
					await script.loadedScript.call(script.loadedScript.install, {});
				} else {
					this.logger.warn(`Skipping over add-on ${addOn.name} add-on type ${script.addOnType}, as no install() function found or was not a function.`);
				}
			}
		}
		this.logger.info("Package install complete.");
		return { status: true };

	}

	/**
	 * Runs an npm command
	 * It is recommended this is ran in a worker thread.
	 * WARNING! This will change the current dir.
	 * WARNING! This does not add the package to the registry either.
	 * @param packageName Name of package to run on
	 * @param command Command to run
	 * @param options Options
	 */
	private runNpm(packageName: string, command: keyof typeof npm["commands"], options?: ManagerOptions): Promise<void> {
		return new Promise((resolve, reject) => {
			const npmLogger = new Logger({ // For npm to log with
				name: "add-ons:registry:npm",
			});
			this.logger.info(`Running command npm ${command} ${packageName}...`);
			this.logger.debug("Running command...");
			const oldCWD = this.directory;
			// FIXME: This causes issues, since other stuff can be ran that assumee the DIR is x 
			process.chdir(this.directory); // So lock files are made etc
			this.logger.debug(`Current CWD (before run): ${process.cwd()}`);
			this.logger.debug(`Changed dir to ${this.directory}.`);
			// Functions
			npm.load({
				"bin-links": false,
				"save": true,
				"force": options?.force ? true : false,
			}, (err) => {
				// catch errors
				if (err) {
					npmLogger.err("Error loading npm!");
					return reject(err);
				}
				this.logger.debug("Npm loaded.");
				npm.commands[command]([packageName], (er, data) => {
					if (er) {
						npmLogger.err("Error running npm!");
						return reject(er);
					}
					npmLogger.info(data);
					process.chdir(oldCWD);
					this.logger.debug("Gone back to old CWD.");
					this.logger.debug(`Current CWD: ${process.cwd()}`);
					this.logger.info("Command should have been ran successfully.");
					resolve();
				});
				npm.on("log", (message) => {
					// log the progress of the installation
					npmLogger.info(message);
				});
			});
		});
	}
	
	/**
	 * Uninstalls a package, removing it from the DB as well
	 * @param packageName Name of package to uninstall
	 * @param options Options
	 */
	public async uninstall(packageName: string, options?: ManagerOptions): Promise<void> {
		this.logger.info(`Uninstalling package ${packageName}...`);
		try {
			this.logger.debug("Checking if package exists...");
			await fs.access(join(this.registryModulesPath, packageName)); // will throw err
			await this.runNpm(packageName, "remove", options);
			this.logger.debug("Remove package from registry...");
			// If local, get Name and use that
			await this.removePackageFromDB(packageName);
			return;
		} catch (err) {
			this.logger.err("Error when uninstalling!");
			if (err.code === "ENOENT") {
				this.logger.err("Package that was requested to be uninstalled not installed in the first place.");
				this.logger.err(`If you think this is in error, try running "npm remove ${packageName}" in ${this.directory}`);
			}
			throw err;
		}
	}

	/**
	 * Update package to version
	 * @param packageName Name of package to update
	 * @param version Ideally, SemVer compliant version to update to, but any npm version string (e.g. latest and beta) that comes after package@... is accepted
	 * NOTE: We can't yet test this using a 2Keys package due to lack of one in the main npm registry
	 */
	public async update(packageName: string, version = "latest", options?: ManagerOptions & { version: never }): Promise<ValidatorReturn> {
		this.logger.info(`Updating package ${packageName} to version ${version}...`);
		try {
			await this.runNpm(packageName + "@" + version, "install", options);
			this.logger.info("Reindexing package in registry...");
			return this.addPackageToDB(packageName, {
				...options,
				force: true,
				update: true,
			});
		} catch (err) {
			this.logger.err("ERROR when updating!");
			throw err;
		}
	}

	// Registry SQLite functions
	/**
	 * Initalises the DB so we can use it
	 */
	public async initDB(): Promise<void> {
		if (typeof this.registry === "undefined" || !this.registry) {
			this.registry = await openDB({
				filename: this.registryDBFilePath,
				driver: sqlite3.Database,
			});
		}
	}

	/**
	 * Force reindex the registry, by running {@link AddOnsRegistry.addPackageToDB()} on all packages in `package.json`
	 */
	public async reindex(): Promise<void> {
		this.logger.info("Reindexing package registry from package.json...");
		this.logger.warn("Wiping registry..."); // Wipe DB
		try {
			this.logger.debug("Loading DB if not loaded...");
			await this.initDB();
			await this.registry.all(`DELETE FROM ${REGISTRY_TABLE_NAME};`);
			this.logger.info("DB wiped. Will now readd packages from package.json");
			const pkgJSON = JSON.parse((await fs.readFile(join(this.directory, "package.json"))).toString("utf8"));
			const deps = Object.keys(pkgJSON.dependencies);
			for (const dep of deps) {
				this.logger.debug(`Reindexing package ${dep}...`);
				const status = await this.addPackageToDB(dep);
				if (!status.status) {
					this.logger.err(`Could not add package ${dep}!`);
					this.logger.err(`Reason: ${status.message}`);
					this.logger.warn("The package has been ignored.");
				}
			}
			this.logger.info("Packages reindexed.");
		} catch (err) {
			this.logger.err("Error reindexing!");
			this.logger.err(err.message);
			throw err;
		}
	}

	/**
	 * Adds a package to the registry DB
	 * @param name Name of package to add
	 * @returns flag of if package was added (true) or not (false) and message why if not added
	 */
	public async addPackageToDB(name: string, options?: AddPackageOptions): Promise<ValidatorReturn> {
		this.logger.info(`Adding package (add-on) ${name} to DB...`);
		this.logger.debug("Loading DB if not loaded...");
		await this.initDB();
		const packageLocation = join(this.registryModulesPath, name);
		this.logger.debug(`Package location: ${packageLocation}`);
		this.logger.debug("Checking if package already in registry...");
		const state = await this.getPackagesFromDB(name);
		if (!state?.status) {
			this.logger.err("There was an error retrieving package of name ${name}.");
			this.logger.err(state?.message || "NO MESSAGE FOUND");
			return state;
		}
		if (typeof state.results !== "undefined" && state.results.length > 0) {
			if (!options?.force) {
				this.logger.warn(`Package ${name} was already in the registry.`);
				this.logger.warn("If you want to force overwrite what is in the registry, please pass { force: true } to AddOnsRegistry.addPackageToDB().");
				this.logger.warn("This probably means --force on the CLI.");
				return {
					status: false,
					message: "Package already in registry.",
				};
			} else {
				if (!options.update) {
					// Don't update, remove
					this.logger.warn(`Removing any packages by name ${name} in registry already.`);
					await this.removePackageFromDB(name);
					this.logger.debug("Documents removed.");
				} else {
					// Update
					this.logger.warn(`Please note all packages of name ${name} will be updated to the new package.`);
				}
			}
		}
		this.logger.debug("Validating package is installed...");
		try {
			await fs.access(packageLocation);
			this.logger.debug("Reading package.json");
			const packageJSON: { twokeys: TwokeysPackageInfo; [key: string]: any } = JSON.parse((await fs.readFile(join(packageLocation, "package.json"))).toString("utf8"));
			// Validate
			const validation = AddOnsRegistry.validatePackageJSON(packageJSON, this.LoggerConstructor);
			if (!validation.status) {
				this.logger.err("Error validating package.json.");
				this.logger.warn("Package not added.");
				return {
					status: false,
					message: validation.message,
				};
			}
			// Check if has entry point
			this.logger.debug("Inserting...");
			this.logger.debug("Creating document structure for registry...");
			const docToInsert: Package = AddOnsRegistry.convertPackageJSONToDBDocument(packageJSON);
			this.logger.debug("About to run insert");
			const documentConverted = AddOnsRegistry.convertPackageForDB(docToInsert);
			let stmt: Statement;
			if (options?.update) {
				this.logger.debug("Using an SQLite UPDATE command.");
				stmt = await this.registry.prepare(
					`UPDATE ${REGISTRY_TABLE_NAME} SET id = @id, name = @name, types = @types, info = @info, entry = @entry WHERE name = @packname`,
				);
			} else {
				stmt = await this.registry.prepare(
					`INSERT INTO ${REGISTRY_TABLE_NAME} (id, name, types, info, entry) VALUES (@id, @name, @types, @info, @entry)`,
				);
			}
			await stmt.all({
				"@name": documentConverted.name,
				"@id": documentConverted.id,
				"@types": documentConverted.types,
				"@info": documentConverted.info,
				"@entry": documentConverted.entry,
				"@packname": options?.update ? documentConverted.name : undefined,
			});
			await stmt.finalize();
			this.logger.info(`Package ${name} added to registry.`);
			return { status: true };
		} catch (err) {
			this.logger.err("ERROR!");
			if (err?.code === "ENOENT") {
				this.logger.err("Executor not installed, or no package.json");
				this.logger.err(err.message);
				throw new Error(`Package (add-on) ${name} not installed, or package.json does not exist`);
			} else {
				throw err;
			}
		}
	}

	/**
	 * Removes all instances of a package from the DB
	 * @param packageName Name of package to delete
	 */
	private async removePackageFromDB(packageName: string): Promise<void> {
		this.logger.info(`Removing any packages by name ${packageName} in registry DB.`);
		try {
			this.logger.debug("Loading DB if not loaded...");
			await this.initDB();
			await this.registry.all(`DELETE FROM ${REGISTRY_TABLE_NAME} WHERE name=?`, packageName);
			this.logger.debug("Documents removed.");
		} catch (err) {
			this.logger.err("Error removing package!");
			this.logger.err(err.message);
			throw err;
		}
	}

	/**
	 * Updates all instances of a package from the DB
	 * @param packageName Name of package to update
	 * @param updateContent Contents to update
	 */
	/*private async updatePackageInDB(packageName: string, updateContent: PackageInDB): Promise<void> {
		logger.info(`Updating any packages by name ${packageName} in registry DB.`);
		try {
			await this.registry.all(`DELETE FROM ${REGISTRY_TABLE_NAME} WHERE name=?`, packageName);
		} catch (err) {
			logger.err("Error removing package!");
			logger.err(err.message);
			throw err;
		}
		logger.debug("Documents removed.");
	}*/

	/**
	 * Retrieves a package from the DB and parses it to a {@link Package}
	 * @param packageName Name of package to get
	 */
	public async getPackagesFromDB(packageName: string): Promise<GetPackageReturn> {
		this.logger.info(`Getting info for package ${packageName} from DB...`);
		try {
			this.logger.debug("Loading DB if not loaded...");
			await this.initDB();
			const docs = await this.queryDBForPackage(packageName);
			this.logger.debug("Raw DB output retrieved.");
			this.logger.debug(`Converting ${docs.length} documents...`);
			const newDocs: Package[] = [];
			for (const doc of docs) {
				const newDoc = this.parsePackageFromDB(doc);
				if (!newDoc.status || !newDoc.entry) {
					this.logger.err(`An error was encountered converting document of name ${doc.name} to a Package!`);
					return {
						status: false,
						message: newDoc.message || "No parsed package was received back",
					};
				} else {
					newDocs.push(newDoc.entry);
					this.logger.debug(`Document of name ${newDoc.entry.name} parsed.`);
				}
			}
			return { status: true, results: newDocs };
		} catch (err) {
			this.logger.err("An error was encountered retrieving data from DB!");
			this.logger.err(err.message);
			throw err;
		}
	}

	/**
	 * Querys the DB for a package, returning the raw {@link PackageInDB}
	 * @param packageName Package name to find
	 */
	private async queryDBForPackage(packageName: string): Promise<PackageInDB[]> {
		this.logger.debug(`Query DB for package ${packageName}...`);
		this.logger.debug("Loading DB if not loaded...");
		await this.initDB();
		return this.registry.all(`SELECT * FROM ${REGISTRY_TABLE_NAME} WHERE name = ?`, packageName);
	}

	/**
	 * Parses an SQLite entry of a package into an actual package object.
	 * Use because be can't have objects in tables.
	 * @param entry Entry from the database to parse
	 */
	private parsePackageFromDB(entry: PackageInDB): ParseDBReturn {
		this.logger.debug("Parsing an entry from the DB...");
		const returned: any = {
			id: entry.id,
			name: entry.name,
		};
		this.logger.debug("Validating info...");
		returned.info = JSON.parse(entry.info);
		if (!returned.info?.version || !returned.info?.description) {
			this.logger.err("Either the version of description field was mising from info.");
			return {
				status: false,
				message: "Either the version of description field was mising from info.",
			};
		}
		this.logger.debug("Validating types & entries...");
		returned.types = JSON.parse(entry.types);
		returned.entry = JSON.parse(entry.entry);
		for (const typeClaim of returned.types) {
			if (!TWOKEYS_ADDON_TYPES_ARRAY.includes(typeClaim)) {
				this.logger.err(`Type ${typeClaim} is not a valid type!`);
				return {
					status: false,
					message: `Type ${typeClaim} is not a valid type!`,
				};
			} else {
				this.logger.debug(`Checking type ${typeClaim} for an entry...`);
				if (!returned.entry[typeClaim]) {
					this.logger.err(`Type ${typeClaim} did not have an entry point!`);
					return {
						status: false,
						message: `Type ${typeClaim} did not have an entry point!`,
					};
				}
			}
		}
		// Now we can be sure it is right
		return { entry: returned as Package, status: true };
	}

	// Static methods
	/**
	 * Creates a new registry in dir & the SQLite3 DB to go with it
	 * @param dir Directory to create registry in
	 */
	public static async createNewRegistry(dir: string, options?: AddOnsRegistryOptions): Promise<ValidatorReturn> {
		const logger = new Logger({ name: "add-ons:registry" });
		logger.info(`Creating new registry in ${dir}...`);
		try {
			await mkdirp(dir);
			logger.info("Directory made.");
			logger.info("Writing default package.json...");
			await fs.writeFile(join(dir, "package.json"), JSON.stringify(DEFAULT_REGISTRY_ROOT_PACKAGE_JSON));
			logger.info("Creating registry DB...");
			logger.debug("Checking if registry DB file already exists...");
			try {
				await fs.access(options?.dbFilePath || join(dir, REGISTRY_FILE_NAME), fsconstants.F_OK);
				return { status: false, message: "DB already exists." }; // If we get here, ENOENT not thrown
			} catch (err) {
				if (err.code === "ENOENT") {
					logger.debug("DB did not exist, so creating it...");
				} else {
					logger.err("Other error encountered checking if DB file already existed!");
					throw err;
				}
			}
			const db = await openDB({
				filename: options?.dbFilePath || join(dir, REGISTRY_FILE_NAME),
				driver: sqlite3.Database,
			});
			logger.debug(`Adding ${REGISTRY_TABLE_NAME} table...`);
			await db.exec(CREATE_REGISTRY_DB_QUERY);
			logger.debug("Closing...");
			await db.close();
			logger.info("SQLite registry DB & tables created.");
		} catch (err) {
			logger.err("An error was encountered!");
			throw err;
		}
		logger.info("Registry created.");
		return { status: true };
	}

	/**
	 * Validates a package.json.
	 * Tested by the functions that test the insyall function
	 * @param packageJSON Parsed package.json to validate
	 * @returns flag of if package was added (true) or not (false) and err message if not added
	 */
	public static validatePackageJSON(packageJSON: Record<string, unknown> & { twokeys?: TwokeysPackageInfo }, LoggerConstructor: typeof Logger = Logger): ValidatorReturn {
		const logger = new LoggerConstructor({
			name: "add-ons:registry"
		});
		logger.info("Validating a package.json...");
		logger.debug(JSON.stringify(packageJSON));
		// Check if has twokeys metadata
		if (!Object.prototype.hasOwnProperty.call(packageJSON, "twokeys")) {
			logger.err("Package does not contain 2Keys metadata!");
			return {
				status: false,
				message: "Package does not contain 2Keys metadata!",
			};
		}
		// Check type is valid
		if (!packageJSON.twokeys?.types?.some(element => TWOKEYS_ADDON_TYPES_ARRAY.includes(element))) {
			logger.err("No valid type was listed in the package.json!");
			return {
				status: false,
				message: "No valid type was listed in the package.json!",
			};
		}
		// Check if entry points present for each of twokeys.types
		for (const addOnType of packageJSON.twokeys.types) {
			if (TWOKEYS_ADDON_TYPES_ARRAY.includes(addOnType)) {
				if (!(Object.prototype.hasOwnProperty.call(packageJSON.twokeys.entry, addOnType) && typeof packageJSON.twokeys.entry[addOnType] === "string")) {
					logger.err(`Entry point was not found for add-on type ${addOnType}`);
					return {
						status: false,
						message: `Entry point was not found for add-on type ${addOnType}`,
					};
				}
			} else {
				logger.warn(`Type ${addOnType} is not a valid type.  ignoring...`);
			}
		}
		logger.info("package.json is valid");
		return { status: true };
	}

	/**
	 * Converts a add-ons's package.json into a document that can then be converted for the DB.
	 * This is public so it can be used for testing.
	 * @param packageJSON Package.json to convert
	 */
	public static convertPackageJSONToDBDocument(packageJSON: { [key: string]: any; twokeys: TwokeysPackageInfo }): Package {
		// Type cast & promisify
		// Filters out types that are invalid in twokeys.types
		// Entries are not filtered, just ignored, as it's not worth the compute cycles, as it can just be ignored
		const docToInsert: Package = {
			name: packageJSON.name,
			types: packageJSON.twokeys.types.filter(theType => TWOKEYS_ADDON_TYPES_ARRAY.includes(theType)),
			entry: packageJSON.twokeys.entry,
			info: {
				version: packageJSON.version,
				description: packageJSON.description,
				size: null,
			},
		};
		// Add optional stuff
		if (packageJSON.twokeys.displayName) {
			docToInsert.info.displayName = packageJSON.twokeys.displayName;
		}
		if (packageJSON.twokeys.iconURL) {
			docToInsert.info.iconURL = packageJSON.twokeys.iconURL;
		}
		return docToInsert;
	}

	/**
	 * Converts a package object for storage in the sqlite DB
	 * @param packageToAdd Package object to convert for storage
	 */
	private static convertPackageForDB(packageToAdd: Package): PackageInDB {
		return {
			id: uuidv4(),
			name: packageToAdd.name,
			types: JSON.stringify(packageToAdd.types),
			info: JSON.stringify(packageToAdd.info),
			entry: JSON.stringify(packageToAdd.entry),
		};
	}

}
