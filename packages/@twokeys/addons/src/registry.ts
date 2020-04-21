/**
 * Controls the management of 2Keys packages
 */
import mkdirp from "mkdirp";
import Datastore from "nedb";
import { promisify } from "util";
import { promises as fs, close } from "fs";
import { join } from "path";
import { Logger } from "@twokeys/core";
import { DEFAULT_REGISTRY_ROOT_PACKAGE_JSON, REGISTRY_FILE_NAME } from "./constants";

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
	 * Adds a package to the registry DB
	 * @param options Options that describe the package to add
	 */
	public addPackage() {
		logger.info("ADDing");
	}

	/**
	 * Creates a new registry in dir
	 * @param dir Directory to create registry in
	 */
	public static async createNewRegistry(dir: string) {
		logger.info(`Creating new registry in ${dir}...`);
		await mkdirp(dir);
		logger.debug("Directory made.");
		logger.debug("Writing default package.json...");
		fs.writeFile(join(dir, "package.json"), JSON.stringify(DEFAULT_REGISTRY_ROOT_PACKAGE_JSON));
		logger.debug("Creating registry DB...");
		const fd = await fs.open(join(dir, REGISTRY_FILE_NAME), "w");
		await fd.close(); // CLose immediately
		logger.info("Registry created.");
	}

}
