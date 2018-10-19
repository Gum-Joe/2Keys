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

export async function config_loader(): Config {
	try {
		const config: Buffer = await readFile(join(process.cwd(), CONFIG_FILE));
		const parsed_config: Config = YAML.parse(config.toString());
		return parsed_config;
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

