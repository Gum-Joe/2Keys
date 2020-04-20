/**
 * Handles config parsing
 * Requires config to be given
 */
import { promises as fs } from "fs";
import YAML from "yaml";
import { ServerConfig, DetectorConfig, ClientConfig, ProjectConfig } from "../lib/interfaces";
import Logger from "./logger";

const logger = new Logger({
	name: "config",
});

/**
 * Loads and parses a YAML config from a file
 * Configs can be of three types, defines in `interfaces.ts`:
 * - Config for the server (see interface `ServerConfig`)
 * - Config for a project (see interface `ProjectConfig`)
 * - Config for a client (see interface `ClientConfig`)
 * - Config for a detector that is used in a project (see interface `DetectorConfig`)
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
