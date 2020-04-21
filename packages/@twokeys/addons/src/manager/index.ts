/**
 * Contains add-on management code
 */
import { Logger } from "@twokeys/core";

const logger = new Logger({
	name: "add-ons:manager",
});

/**
 * Class object for add-on management
 * Used to install and uninstall new add-ons
 */
export default class AddOnManager {
	/** Directory where add-ons are stored (equivalent to node_modules) */
	public directory: string;

	/**
	 * Constructor for `AddOnManager`
	 * @param dir Directory where add-ons are stored (equivalent to node_modules)
	 */
	constructor(dir: string) {
		logger.debug("New add-on manager initialised.");
		this.directory = dir;
	}

	/**
	 * Installs a new add-on (using yarn) to `this.directory`
	 * @param packageName Name of package from npm registry to install
	 */
	public install(packageName: string) {
		logger.info(`Installing new package ${packageName} using yarn...`);
	}

}
