/**
 * @overview Index file for initialising a 2Keys project/config
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
  writeStream.on("error", (err) => {
    if (argv.force && err.code === "EEXIST") {
      return;
    }
    if (err.code === "EEXIST") {
      logger.throw(new Error("Config file already exists! Exiting as a result."))
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