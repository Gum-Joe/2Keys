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
import sqlite3 from "sqlite3";
import { v4 as uuidv4 } from "uuid";
import { open as openDB, Database, Statement } from "sqlite";
import { promises as fs } from "fs";
import { join } from "path";
import { Logger } from "@twokeys/core";
import { DEFAULT_REGISTRY_ROOT_PACKAGE_JSON, REGISTRY_FILE_NAME, CREATE_REGISTRY_DB_QUERY, REGISTRY_TABLE_NAME, REGISTRY_MODULE_FOLDER } from "./constants";
import { Package, PackageInDB, TWOKEYS_ADDON_TYPES_ARRAY, TwokeysPackageInfo, ValidatorReturn, TWOKEYS_ADDON_TYPES, TWOKEYS_ADDON_TYPE_EXECUTOR, TWOKEYS_ADDON_TYPE_DETECTOR, TWOKEYS_ADDON_TYPE_SINGLE } from "./interfaces";
import { Executor, DetectorController, AddOnModulesCollection } from "./module-interfaces";

const logger = new Logger({
	name: "add-ons:registry",
});

/**
 * Options for add-on registry constructor
 */
interface AddOnsRegistryOptions {
	/** Absolute path of registry database (a sqlite3 .db file) */
	dbFilePath?: string;
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
 */
type LoadedAddOn<AddOnsType extends (TWOKEYS_ADDON_TYPES & string)> = AddOnModulesCollection[AddOnsType] &  { package: Package };

/**
 * Defines the methods {@link AddOnsRegistry} should implement.
 * Many returns types left out as we don't know what they will be.
 */
interface AddOnsRegistryInterface {
	// Package operations
	/** Removes a package from node_modules via npm & the DB */
	uninstall: (packageName: string) => any;
	/** Removes a package via npm */
	runNpmUninstall: (packageName: string) => any;
	/** Removes a package from the DB */
	removePackageFromDB: (packageName: string) => any;
	/** Installs a package & adds to DB */
	install: (packageName: string, options?: ManagerOptions) => any;
	/** Adds a package via npm */
	runNpmInstall: (packageName: string, options?: ManagerOptions) => any;
	/** Removes a package from the DB */
	addPackageToDB: (packageName: string, options?: AddPackageOptions) => any;
	/** Update package to version */
	update: (packageName: string, version: string) => any;
	runNpmUpdate: (packageName: string, version: string) => any;
	/** Update package in DB */
	updatePackageInDB: (packageName: string, propsToUpdate: any) => any;
	/** Force reindex the registry, by running {@link AddOnsRegistry.addPackageToDB()} on all packages in `package.json` */
	reindex: () => any;

	// Loaders
	/** Loads one package in full, */
	load: (packageName: string, types?: TWOKEYS_ADDON_TYPES | TWOKEYS_ADDON_TYPES[]) => any;
	/** Loads all add-ons of a given type */
	loadAll: (types?: TWOKEYS_ADDON_TYPES | TWOKEYS_ADDON_TYPES[]) => any;

	// Misc
	createNewRegistry: (dir: string, options?: AddOnsRegistryOptions) => any;
}

// TODO: Before and after hooks
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

	private directory: string;
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore: Is initalised by this.initDB()
	private registry: Database<sqlite3.Database, sqlite3.Statement>;
	private registryDBFilePath: string;
	private registryModulesPath: string;

	/**
	 * Initalises a new registry class for the registry at `dir`
	 * @param dir Directory with root package.JSON in
	 */
	constructor(dir: string, options?: AddOnsRegistryOptions) {
		logger.debug(`New registry class created for ${dir}`);
		this.directory = dir;
		this.registryDBFilePath = options?.dbFilePath || join(this.directory, REGISTRY_FILE_NAME);
		this.registryModulesPath = join(this.directory, REGISTRY_MODULE_FOLDER);
	}

	// Load functions
	/**
	 * Loads an {@link Package} (so a package that has already been retrieved from DB)
	 * @param packageToLoad Package object to load from, converted from {@link PackageInDB}
	 * @param typeOfAddOn SINGLE type to load
	 * @template AddOnsTypes Type of add-on to load; see {@link TWOKEYS_ADDON_TYPES}. Single one only.
	 */
	private async loadPackage<AddOnsType extends TWOKEYS_ADDON_TYPE_SINGLE>(packageToLoad: Package, typeOfAddOn: AddOnsType): Promise<LoadedAddOn<AddOnsType>> {
		try {
			logger.info(`Loading package ${packageToLoad.name}, type ${typeOfAddOn}...`);
			logger.debug(JSON.stringify(packageToLoad));
			console.log(packageToLoad.entry);
			console.log(typeof packageToLoad.entry);
			console.log("a" + typeOfAddOn + "a");
			console.log(Object.prototype.hasOwnProperty.call(packageToLoad.entry, typeOfAddOn));
			console.log(packageToLoad.entry[typeOfAddOn]);
			if (Object.prototype.hasOwnProperty.call(packageToLoad.entry, typeOfAddOn)) {
				const file: string = join(this.registryModulesPath, packageToLoad.name, packageToLoad.entry[typeOfAddOn]);
				logger.debug(`Loading type ${typeOfAddOn} from file ${file}...`);
				// load
				const loaded: LoadedAddOn<AddOnsType> = require(file);
				logger.debug("Type of add-on loaded.");
				// Add package object
				loaded.package = packageToLoad;
				logger.info("Add-on loaded.");
				return loaded;
			} else {
				// Not found!
				logger.err(`Add-on of type ${typeOfAddOn} not in package (add-on) ${packageToLoad.name} entries!`);
				throw new Error(`Add-on of type ${typeOfAddOn} not in package (add-on) ${packageToLoad.name} entries!`);
			}
		} catch (err) {
			logger.err("Error loading package!");
			throw err;
		}
	}
	/**
	 * Loads an add-on, getting add-on code for a given type, by querying DB
	 * @param packageName Name of package (add-on) to load
	 * @param typeOfAddOn SINGLE type to load
	 * @template AddOnsTypes Type of add-on to load; see {@link TWOKEYS_ADDON_TYPES}. Single one only.
	 */
	public async load<AddOnsType extends TWOKEYS_ADDON_TYPE_SINGLE>(packageName: string, typeOfAddOn: AddOnsType): Promise<LoadedAddOn<AddOnsType>> {
		logger.info(`Loading add-on ${packageName}...`);
		try {
			// Query DB for package
			const packagesResults = await this.getPackagesFromDB(packageName);
			if (!packagesResults.status) {
				logger.err("Error loading package!");
				throw new Error(`Error loading package: ${packagesResults.message || "See logs above"}`);
			} else if (typeof packagesResults.results === "undefined" || packagesResults.results.length < 1) {
				logger.err(`No packages were found by name ${packageName}!`);
				const err: any = new Error(`No packages were found by name ${packageName}!`);
				err.code = "ENOENT";
				throw err;
			} else if (packagesResults.results.length > 1) {
				logger.err("Error! Got back multiple packages!");
				logger.err("This means the registry DB may be corrupt.");
				logger.err("Please reindex the packages DB in full.");
				throw new Error("Got back multiple packages! Registry DB may be corrupt!");
			} else {
				// Everything OK, so we can load
				return await this.loadPackage<AddOnsType>(packagesResults.results[0], typeOfAddOn);
			}
		} catch (err) {
			logger.err("Error loading package!");
			throw err;
		}
	}
	/** Loads an executor */
	public async loadExecutor(packageName: string): Promise<Executor> {
		return (await this.load<TWOKEYS_ADDON_TYPE_EXECUTOR>(packageName, TWOKEYS_ADDON_TYPE_EXECUTOR));
	}
	/** Loads a detector */
	public async loadDetector(packageName: string): Promise<DetectorController> {
		return (await this.load<TWOKEYS_ADDON_TYPE_DETECTOR>(packageName, TWOKEYS_ADDON_TYPE_DETECTOR));
	}
	/**
	 * Loads all add-ons of a given type
	 * @param typeOfAddOn Add-on type to load
	 * @template AddOnsTypes Type of add-on to load; see {@link TWOKEYS_ADDON_TYPES}. Single one only
	 */
	public async loadAllOfType<AddOnsType extends (TWOKEYS_ADDON_TYPES & string)>(typeOfAddOn: AddOnsType): Promise<{ [name: string]: LoadedAddOn<AddOnsType> }> {
		logger.info(`Loading all modules of type ${typeOfAddOn}...`);
		logger.debug("Querying...");
		const addOnsList: Package[] = (await this.registry.all(`SELECT * FROM ${REGISTRY_TABLE_NAME} WHERE types LIKE ?`, `%${typeOfAddOn}%`)).map(value => {
			const res = this.parsePackageFromDB(value);
			if (!res.status || !res.entry) { throw new Error(res.message); }
			return res.entry;
		});
		logger.debug(JSON.stringify(addOnsList));
		const loadedAddOns: { [name: string]: LoadedAddOn<AddOnsType> } = {};
		for (const addOn of addOnsList) {
			loadedAddOns[addOn.name] = await this.loadPackage<AddOnsType>(addOn, typeOfAddOn);
		}
		return loadedAddOns;

	}

	// Package management operations
	/**
	 * Installs a new package (through {@link AddOnsRegistry.runNpmInstall}) AND adds it to the registry
	 * @param packageName Packe to install
	 * @param options Options
	 */
	public async install(packageName: string, options?: ManagerOptions): Promise<ValidatorReturn> {
		logger.info("Installing new package...");
		const packageString = options?.version ? packageName + "@" + options.version : packageName;
		logger.info(`Package: ${packageString}`);
		await this.runNpm(packageString, "install", options);
		logger.debug("Adding package to registry...");
		// If local, get Name and use that
		if (options?.local) {
			logger.debug("Local package.  Getting name...");
			const packageJSON = JSON.parse((await fs.readFile(join(packageName, "package.json"))).toString("utf8"));
			return await this.addPackageToDB(packageJSON.name, options);
		} else {
			return await this.addPackageToDB(packageName, options);
		}
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
	private runNpm(packageName: string, command: string, options?: ManagerOptions): Promise<void> {
		return new Promise((resolve, reject) => {
			const npmLogger = new Logger({ // For npm to log with
				name: "add-ons:registry:npm",
			});
			logger.info(`Running command npm ${command} ${packageName}...`);
			logger.debug("Running command...");
			const oldCWD = this.directory;
			process.chdir(this.directory); // So lock files are made etc
			logger.debug(`Changed dir to ${this.directory}.`);
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
				logger.debug("Npm loaded.");
				npm.commands[command]([packageName], (er, data) => {
					if (er) {
						npmLogger.err("Error running npm!");
						return reject(er);
					}
					npmLogger.info(data);
					process.chdir(oldCWD);
					logger.debug("Gone back to old CWD.");
					logger.info("Command should have been ran successfully.");
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
		logger.info(`Uninstalling package ${packageName}...`);
		try {
			logger.debug("Checking if package exists...");
			await fs.access(join(this.registryModulesPath, packageName)); // will throw err
			await this.runNpm(packageName, "remove", options);
			logger.debug("Remove package from registry...");
			// If local, get Name and use that
			await this.removePackageFromDB(packageName);
			return;
		} catch (err) {
			logger.err("Error when uninstalling!");
			if (err.code === "ENOENT") {
				logger.err("Package that was requested to be uninstalled not installed in the first place.");
				logger.err(`If you think this is in error, try running "npm remove ${packageName}" in ${this.directory}`);
			}
			throw err;
		}
	}

	/**
	 * Update package to version
	 * @param packageName Name of package to update
	 * @param version SemVer compliant version to update to.
	 */
	public async update(packageName: string, options?: ManagerOptions): Promise<ValidatorReturn> {
		logger.info(`Updating package ${packageName} to version ${options?.version}...`);
		try {
			await this.runNpm(packageName + "@" + options?.version, "install", options);
			logger.info("Reindexing package in registry...");
			return await this.addPackageToDB(packageName, {
				...options,
				force: true,
				update: true,
			});
		} catch (err) {
			logger.err("ERROR when updating!");
			throw err;
		}
	}

	// Registry SQLite functions
	/**
	 * Initalises the DB so we can use it
	 * @param entry 
	 */
	public async initDB(): Promise<void> {
		this.registry = await openDB({
			filename: this.registryDBFilePath,
			driver: sqlite3.cached.Database,
		});
	}

	/**
	 * Force reindex the registry, by running {@link AddOnsRegistry.addPackageToDB()} on all packages in `package.json`
	 */
	public async reindex(): Promise<void> {
		logger.info("Reindexing package registry from package.json...");
		logger.warn("Wiping registry..."); // Wipe DB
		try {
			logger.debug("Loading DB if not loaded...");
			if (!this.registry) {
				await this.initDB();
			}
			await this.registry.all(`DELETE FROM ${REGISTRY_TABLE_NAME};`);
			logger.info("DB wiped. Will now readd packages from package.json");
			const pkgJSON = JSON.parse((await fs.readFile(join(this.directory, "package.json"))).toString("utf8"));
			const deps = Object.keys(pkgJSON.dependencies);
			for (const dep of deps) {
				logger.debug(`Reindexing package ${dep}...`);
				const status = await this.addPackageToDB(dep);
				if (!status.status) {
					logger.err(`Could not add package ${dep}!`);
					logger.err(`Reason: ${status.message}`);
					logger.warn("The package has been ignored.");
				}
			}
			logger.info("Packages reindexed.");
		} catch (err) {
			logger.err("Error reindexing!");
			logger.err(err.message);
			throw err;
		}
	}

	/**
	 * Adds a package to the registry DB
	 * @param name Name of package to add
	 * @returns flag of if package was added (true) or not (false) and message why if not added
	 */
	public async addPackageToDB(name: string, options?: AddPackageOptions): Promise<ValidatorReturn> {
		logger.info(`Adding package (add-on) ${name} to DB...`);
		logger.debug("Loading DB if not loaded...");
		if (!this.registry) {
			await this.initDB();
		}
		const packageLocation = join(this.registryModulesPath, name);
		logger.debug(`Package location: ${packageLocation}`);
		logger.debug("Checking if package already in registry...");
		const state = await this.getPackagesFromDB(name);
		if (!state.status) {
			logger.err("There was an error retrieving package of name ${name}.");
			logger.err(state?.message || "NO MESSAGE FOUND");
			return state;
		}
		if (typeof state.results !== "undefined" && state.results.length > 0) {
			if (!options?.force) {
				logger.warn(`Package ${name} was already in the registry.`);
				logger.warn("If you want to force overwrite what is in the registry, please pass { force: true } to AddOnsRegistry.addPackageToDB().");
				logger.warn("This probably means --force on the CLI.");
				return {
					status: false,
					message: "Package already in registry.",
				};
			} else {
				if (!options.update) {
					// Don't update, remove
					logger.warn(`Removing any packages by name ${name} in registry already.`);
					await this.removePackageFromDB(name);
					logger.debug("Documents removed.");
				} else {
					// Update
					logger.warn(`Please note all packages of name ${name} will be updated to the new package.`);
				}
			}
		}
		logger.debug("Validating package is installed...");
		try {
			await fs.access(packageLocation);
			logger.debug("Reading package.json");
			const packageJSON: { twokeys: TwokeysPackageInfo; [key: string]: any } = JSON.parse((await fs.readFile(join(packageLocation, "package.json"))).toString("utf8"));
			// Validate
			const validation = AddOnsRegistry.validatePackageJSON(packageJSON);
			if (!validation.status) {
				logger.err("Error validating package.json.");
				logger.warn("Package not added.");
				return {
					status: false,
					message: validation.message,
				};
			}
			// Check if has entry point
			logger.debug("Inserting...");
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
					size: null, // Inserted later
				},
			};
			// Add optional stuff
			if (packageJSON.twokeys.displayName) {
				docToInsert.info.displayName = packageJSON.twokeys.displayName;
			}
			if (packageJSON.twokeys.iconURL) {
				docToInsert.info.iconURL = packageJSON.twokeys.iconURL;
			}
			logger.debug("About to run insert");
			const documentConverted = this.convertPackageForDB(docToInsert);
			let stmt: Statement<sqlite3.Statement>;
			if (options?.update) {
				logger.debug("Using an SQLite UPDATE command.");
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
			logger.info(`Package ${name} added to registry.`);
			return { status: true };
		} catch (err) {
			logger.err("ERROR!");
			if (err?.code === "ENOENT") {
				logger.err("Executor not installed, or no package.json");
				logger.err(err.message);
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
		logger.info(`Removing any packages by name ${packageName} in registry DB.`);
		try {
			logger.debug("Loading DB if not loaded...");
			if (!this.registry) {
				await this.initDB();
			}
			await this.registry.all(`DELETE FROM ${REGISTRY_TABLE_NAME} WHERE name=?`, packageName);
			logger.debug("Documents removed.");
		} catch (err) {
			logger.err("Error removing package!");
			logger.err(err.message);
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
		logger.info(`Getting info for package ${packageName} from DB...`);
		try {
			logger.debug("Loading DB if not loaded...");
			if (!this.registry) {
				await this.initDB();
			}
			const docs = await this.queryDBForPackage(packageName);
			logger.debug("Raw DB output retrieved.");
			logger.debug("Converting...");
			const newDocs: Package[] = [];
			for (const doc of docs) {
				const newDoc = this.parsePackageFromDB(doc);
				if (!newDoc.status || !newDoc.entry || typeof newDoc.entry === "undefined") {
					logger.err(`An error was encountered converting document of name ${doc.name} to a Package!`);
					return {
						status: false,
						message: newDoc.message || "No parsed package was received back",
					};
				} else {
					newDocs.push(newDoc.entry);
					logger.debug(`Document of name ${newDoc.entry.name} parsed.`);
				}
			}
			return { status: true, results: newDocs };
		} catch (err) {
			logger.err("An error was encountered retrieving data from DB!");
			logger.err(err.message);
			throw err;
		}
	}

	/**
	 * Querys the DB for a package, returning the raw {@link PackageInDB}
	 * @param packageName Package name to find
	 */
	private async queryDBForPackage(packageName: string): Promise<PackageInDB[]> {
		logger.debug(`Query DB for package ${packageName}...`);
		logger.debug("Loading DB if not loaded...");
		if (!this.registry) {
			await this.initDB();
		}
		return await this.registry.all(`SELECT * FROM ${REGISTRY_TABLE_NAME} WHERE name = ?`, packageName);
	}

	/**
	 * Converts a package object for storage in the sqlite DB
	 * @param packageToAdd Package object to convert for storage
	 */
	private convertPackageForDB(packageToAdd: Package): PackageInDB {
		return {
			id: uuidv4(),
			name: packageToAdd.name,
			types: JSON.stringify(packageToAdd.types),
			info: JSON.stringify(packageToAdd.info),
			entry: JSON.stringify(packageToAdd.entry),
		};
	}

	/**
	 * Parses an SQLite entry of a package into an actual package object.
	 * Use because be can't have objects in tables.
	 * @param entry Entry from the database to parse
	 */
	private parsePackageFromDB(entry: PackageInDB): ParseDBReturn {
		logger.debug("Parsing an entry from the DB...");
		const returned: any = {
			id: entry.id,
			name: entry.name,
		};
		logger.debug("Validating info...");
		returned.info = JSON.parse(entry.info);
		if (!returned.info?.version || !returned.info?.description) {
			logger.err("Either the version of description field was mising from info.");
			return {
				status: false,
				message: "Either the version of description field was mising from info.",
			};
		}
		logger.debug("Validating types & entries...");
		returned.types = JSON.parse(entry.types);
		returned.entry = JSON.parse(entry.entry);
		for (const typeClaim of returned.types) {
			if (!TWOKEYS_ADDON_TYPES_ARRAY.includes(typeClaim)) {
				logger.err(`Type ${typeClaim} is not a valid type!`);
				return {
					status: false,
					message: `Type ${typeClaim} is not a valid type!`,
				};
			} else {
				logger.debug(`Checking type ${typeClaim} for an entry...`);
				if (!returned.entry[typeClaim]) {
					logger.err(`Type ${typeClaim} did not have an entry point!`);
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
		logger.info(`Creating new registry in ${dir}...`);
		try {
			await mkdirp(dir);
			logger.info("Directory made.");
			logger.info("Writing default package.json...");
			await fs.writeFile(join(dir, "package.json"), JSON.stringify(DEFAULT_REGISTRY_ROOT_PACKAGE_JSON));
			logger.info("Creating registry DB...");
			const db = await openDB({
				filename: options?.dbFilePath || join(dir, REGISTRY_FILE_NAME),
				driver: sqlite3.Database,
			});
			logger.debug(`Adding ${CREATE_REGISTRY_DB_QUERY} table...`);
			await db.exec(CREATE_REGISTRY_DB_QUERY);
			logger.debug("Closing...");
			await db.close();
			logger.info("SQLite registry DB & tables created.");
			// await fd.close(); // CLose immediately
		} catch (err) {
			logger.err("An error was encountered!");
			if (err.stack.includes(`table ${REGISTRY_TABLE_NAME} already exists`)) {
				logger.warn("Table (registry) already exists.");
				return { status: false, message: "Table (registry) already exists." };
			} else {
				throw err;
			}
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
	public static validatePackageJSON(packageJSON: any): ValidatorReturn {
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
		for (const addOnType of packageJSON.twokeys?.types) {
			if (TWOKEYS_ADDON_TYPES_ARRAY.includes(addOnType)) {
				if (!(Object.prototype.hasOwnProperty.call(packageJSON.twokeys?.entry, addOnType) && typeof packageJSON.twokeys?.entry[addOnType] === "string")) {
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

}
