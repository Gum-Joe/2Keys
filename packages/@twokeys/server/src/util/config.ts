/**
Copyright 2018 Kishan Sambhi

This file is part of 2Keys.

2Keys is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

2Keys is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
*/
/**
 * @overview Config loader for 2Keys
 */
import { readFile as readFileRaw } from "fs";
import { join } from "path";
import YAML from "yaml";
import { promisify } from "util";
import { CONFIG_FILE, DEFAULT_USERSPACE_CONFIG } from "./constants";
import { Config, UserspaceConfig } from "./interfaces";
import Logger from "./logger";

const readFile = promisify(readFileRaw); // For easier handling with async
const logger: Logger = new Logger({ name: "config" });

export async function config_loader(): Promise<Config> {
	try {
		const config: Buffer = await readFile(join(process.cwd(), CONFIG_FILE));
		const parsedConfig: Config = YAML.parse(config.toString());
		return parsedConfig;
	} catch (err) {
		throw err; // Handled by callback
	}
}

export async function userspace_config_loader(): Promise<UserspaceConfig> {
	try {
		const config: Buffer = await readFile(DEFAULT_USERSPACE_CONFIG);
		const parsed_config: UserspaceConfig = YAML.parse(config.toString());
		return parsed_config;
	} catch (err) {
		throw err; // Handled by callback
	}
}

