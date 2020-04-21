/**
 * Controls the management of 2Keys packages
 */
import mkdirp from "mkdirp";
import Datastore from "nedb";
import { promisify } from "util";
import { promises as fs } from "fs";
import { join } from "path";
import { Logger } from "@twokeys/core";
import { DEFAULT_REGISTRY_ROOT_PACKAGE_JSON, REGISTRY_FILE_NAME } from "./constants";
import { PackageInDB, TWOKEYS_ADDON_TYPES_ARRAY } from "./interfaces";

const logger = new Logger({
	name: "add-ons:registry",
});

/**
 * Options for add-on registry
 */
interface AddOnsRegistryOptions {
	/** Location of registry database (a .db file) */
	dbFilePath?: string;
}

/**
 * Registry class
 * Handles management of add-ons
 */
export default class AddOnsRegistry {

	private directory: string;
	private registry: Datastore;
	private registryDBFilePath: string;

	/**
	 * Initalises a new registry class for the registry at `dir`
	 * @param dir Directory with root package.JSON in
	 */
	constructor(dir: string, options?: AddOnsRegistryOptions) {
		logger.debug(`New registry class created for ${dir}`);
		this.directory = dir;
		this.registryDBFilePath = options?.dbFilePath || join(this.directory, REGISTRY_FILE_NAME);
		logger.debug("Loading registry DB file...");
		this.registry = new Datastore(this.registryDBFilePath);
	}

	/**
	 * Validates a package.json
	 * @param packageJSON Parsed package.json to validate
	 * @returns flag of if package was added (true) or not (false) and err message if not added
	 */
	private validatePackageJSON(packageJSON: any): { status: boolean, message?: string } {
		logger.debug("Validating a package.json...");
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
		// Check if entry points present
		for (const addOnType of packageJSON.twokeys?.entry) {
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
		return { status: true };
	}

	/**
	 * Adds a package to the registry DB
	 * @param name Name of package to add
	 * @returns flag of if package was added (true) or not (false) and message why if not added
	 */
	public async addPackage(name: string): Promise<{ status: boolean, message?: string }> {
		logger.info(`Adding package (add-on) ${name} to DB...`);
		const packageLocation = join(this.directory, name);
		logger.debug("Checking if package is installed...");
		try {
			await fs.access(packageLocation);
			logger.debug("Reading package.json");
			const packageJSON = JSON.parse((await fs.readFile(packageLocation, "package.json")).toString("utf8"));
			// Validate
			const validation = this.validatePackageJSON(packageJSON);
			if (!validation.status) {
				logger.err("Error validating package.json")
				logger.warn("Package not added.");
				return {
					status: false,
					message: validation.message,
				};
			}
			// Check if has entry point
			logger.debug("Inserting...");
			// Type cast & promisify
			const inserter: (newDoc: PackageInDB[]) => Promise<any[]> = promisify(this.registry.insert);
			const docToInsert: PackageInDB = {
				name: packageJSON.name,
				types: packageJSON.twokeys.types,
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
			await inserter([docToInsert]);
			logger.info("Package ${name} added to registry.");
			return { status: true };
		} catch (err) {
			logger.err("ERROR!");
			if (err?.code === "ENOENT") {
				throw new Error(`Package (add-on) ${name} not installed, or package.json does not exist`);
			} else {
				throw err;
			}
		}

	}

	/**
	 * Creates a new registry in dir
	 * @param dir Directory to create registry in
	 */
	public static async createNewRegistry(dir: string) {
		logger.info(`Creating new registry in ${dir}...`);
		try { await mkdirp(dir); } catch (err) { throw err; }
		logger.debug("Directory made.");
		logger.debug("Writing default package.json...");
		fs.writeFile(join(dir, "package.json"), JSON.stringify(DEFAULT_REGISTRY_ROOT_PACKAGE_JSON));
		logger.debug("Creating registry DB...");
		try {
			const fd = await fs.open(join(dir, REGISTRY_FILE_NAME), "w");
			await fd.close(); // CLose immediately
		} catch (err) {
			throw err;
		}
		logger.info("Registry created.");
	}

}
