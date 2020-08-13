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
import { MainConfig, DetectorConfig, ClientConfig, ProjectConfig, CombinedConfigs } from "./interfaces";
import Logger from "./logger";
import { TWOKEYS_MAIN_CONFIG_DEFAULT_PATH, TWOKEYS_PROJECT_CONFIG_FILENAME } from "./constants";
import { join } from "path";
import { CodedError } from "./error";

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
export async function loadConfig<ConfigType extends CombinedConfigs>(configFile: string): Promise<ConfigType> {
	logger.debug("Reading config from file " + configFile);
	const config: Buffer = await fs.readFile(configFile);
	const parsedConfig: ConfigType = YAML.parse(config.toString());
	return parsedConfig;
	// NOTE: We let whatever is calling it handle the error
}

/**
 * Loads the main config from the default dir ({@link CONFIG_DEFAULT_FILE_SERVER})
 */
export async function loadMainConfig(file = TWOKEYS_MAIN_CONFIG_DEFAULT_PATH): Promise<MainConfig> {
	logger.debug(`Loading server config from file ${file}...`);
	return loadConfig<MainConfig>(file);
}

/**
 * Loads the project config from a dir
 * @param projectPath absolute path to project to load
 */
export async function loadProjectConfig(projectPath: string): Promise<ProjectConfig> {
	const file = join(projectPath, TWOKEYS_PROJECT_CONFIG_FILENAME);
	logger.debug(`Loading project config from file ${file}...`);
	try {
		return await loadConfig<ProjectConfig>(file);
	} catch (err) {
		if (err.code === "ENOENT") {
			throw new CodedError("Attempted to load a config that was not a project", "INVALID_PROJECT");
		} else {
			throw err;
		}
	}
}

/**
 * Stringifies to YAML the main config
 */
export function stringifyMainConfig(config: MainConfig): string {
	return YAML.stringify(config);
}

/**
 * Stringifies to YAML project config
 */
export function stringifyProjectConfig(config: ProjectConfig): string {
	return YAML.stringify(config);
}