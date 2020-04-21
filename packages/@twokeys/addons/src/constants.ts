/**
 * Constants
 */

export const PACKAGE_VERSION = require("../package.json").version;

export const REGISTRY_FILE_NAME = "twokeys-registry.db";

/** The default package.json file created that represents what's installed in the registry */
export const DEFAULT_REGISTRY_ROOT_PACKAGE_JSON = {
	DO_NOT_MODIFY: true,
	name: "twokeys-local-registry",
	version: PACKAGE_VERSION,
	private: true,
	dependencies: {},
};
