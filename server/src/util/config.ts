/**
 * @overview Config loader for 2Keys
 */
import { readFile as readFileRaw } from "fs";
import * as yaml from "js-yaml";
import { promisify } from "util";

import { CONFIG_FILE } from "./constants";
import { Config } from "./interfaces";
import Logger from "./logger";

const readFile = promisify(readFileRaw); // For easier handling with async
const logger: Logger = new Logger({ name: "config" });

export async function config_loader() {
	try {
		const config: Buffer = await readFile(CONFIG_FILE);
		const parsed_config: Config = yaml.safeLoad(config.toString());
		return parsed_config;
  } catch (err) {
		logger.throw_noexit(err)
  }
}