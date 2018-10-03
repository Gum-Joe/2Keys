/**
 * @overview Index file for initialising a 2Keys project/config
 */
import * as fs from "fs";
import { promisify } from "util";
import { Arguments } from "yargs";
import Logger from "../util/logger";
import { CONFIG_FILE } from "../util/constants";
import get_config from "./get-config";

const logger: Logger = new Logger({
  name: "init"
});

// Util
const access = promisify(fs.access);

/**
 * Function to initalise 2Keys config
 * @param argv Arguments from yargs
 */
const run_init: (argv: Arguments) => void = (argv: Arguments) => {
  logger.info("Starting to initalise a new 2Keys config...");
  get_config();
}

export default async function (argv: Arguments) {
  logger.debug("Checking for a config...")
  const config_status = fs.access(CONFIG_FILE, fs.constants.F_OK, err => {
    if (err || argv.force) {
      run_init(argv);
    } else {
      logger.throw(new Error("Config file already exists! Exiting as a result."))
    }
  });
}