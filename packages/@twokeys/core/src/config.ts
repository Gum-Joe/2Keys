/**
 * Handles config parsing
 * Requires config to be given
 */
import { promises as fs } from "fs";
import YAML from "yaml";
import { ServerConfig, DetectorConfig, ClientConfig, ProjectConfig } from "./interfaces";
import Logger from "./logger";
import { CONFIG_DEFAULT_FILE_SERVER } from "./constants";

const logger = new Logger({
	name: "config",
});

/**
 * Loads and parses a YAML config from a file
 * Configs can be of three types, defined in {@link interfaces.ts}:
 * - Config for the server (see interface {@link ServerConfig})
 * - Config for a project (see interface {@link ProjectConfig})
 * - Config for a client (see interface {@link ClientConfig})
 * - Config for a detector that is used in a project (see interface {@link DetectorConfig})
 * @param configFile File to load config from
 */
export async function loadConfig(configFile: string): Promise<ServerConfig | DetectorConfig | ClientConfig | ProjectConfig> {
	try {
		logger.debug("Reading config from file " + configFile);
		const config: Buffer = await fs.readFile(configFile);
		const parsedConfig: ServerConfig | DetectorConfig | ClientConfig | ProjectConfig = YAML.parse(config.toString());
		return parsedConfig;
	} catch (err) {
		logger.err("ERROR READING CONFIG FILE " + configFile);
		throw err; // Handled by callback
	} 
}

/**
 * Loads the main server config from the default dir ({@link CONFIG_DEFAULT_FILE_SERVER})
 */
export async function loadServerConfig(file = CONFIG_DEFAULT_FILE_SERVER): Promise<ServerConfig> {
	logger.debug(`Loading server config from file ${file}...`);
	return loadConfig(file) as Promise<ServerConfig>;
}
