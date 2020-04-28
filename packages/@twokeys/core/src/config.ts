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
 * Handles config parsing
 * Requires config to be given
 * @packageDocumentation
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
