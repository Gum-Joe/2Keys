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
 * Index file for initialising a 2Keys project/config
 * @packageDocumentation
 */
import * as fs from "fs";
import { promisify } from "util";
import { Arguments } from "yargs";
import YAML from "yaml";
import Logger from "../util/logger";
import { CONFIG_FILE } from "../util/constants";
import get_config from "./get-config";
import { Config } from "../util/interfaces";
import run_oobe from "../oobe";
import gen_files from "./gen-files";
import { rejects } from "assert";
import add_to_startup from "./daemon";

const logger: Logger = new Logger({
	name: "init"
});

// Util

/**
 * Function to initalise 2Keys config
 * @param argv Arguments from yargs
 */
export default async function run_init(argv: Arguments): Promise<void> {
	logger.info("Starting to initalise a new 2Keys config...");
	let config: Config;

	// Create a write stream
	const writeStream = fs.createWriteStream(CONFIG_FILE, {
		flags: argv.force ? "w" : "wx"
	});

	// Only catch error if -f not specified
	writeStream.on("error", (err: NodeJS.ErrnoException) => {
		if (argv.force && err.code === "EEXIST") {
			return;
		}
		if (err.code === "EEXIST") {
			logger.throw(new Error("Config file already exists! Exiting as a result."));
		} else {
			logger.err("Error accessing config file!");
			logger.throw(err);
		}
	});

	try {
		config = await get_config(argv);
		const yaml_config = YAML.stringify(config);

		logger.debug("Config:");
		console.log(yaml_config);

		logger.info("Writing config...");
		writeStream.write(yaml_config);
		writeStream.close();

		logger.info("Generating files...");
		await gen_files(config);

		logger.info("Adding 2Keys server daemon to startup folder...");
		add_to_startup(config.name, argv);

		logger.debug("Running OOBE...");
		await run_oobe(argv);
	} catch (err) {
		logger.throw(err);
	}
}