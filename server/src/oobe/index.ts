/**
 * @overview OOBE entry point
 */
import { writeFile as writeFileRaw } from "fs";
import { promisify } from "util";
import YAML from "yaml";
import { Arguments } from "yargs";
import { DEFAULT_USERSPACE_ROOT, DEFAULT_USERSPACE_CONFIG, default_userspace_config } from "../util/constants";
import Logger from "../util/logger";
import { userspace_config_loader } from "../util/config";
import { UserspaceConfig } from "../util/interfaces";
import fetch_software from "./software";

const writeFile = promisify(writeFileRaw);
const logger = new Logger({
  name: "oobe",
})

export default async function run_oobe(argv: Arguments) {
  logger.info("Starting OOBE...");
  logger.debug("Checking if OOBE has already been ran...");
  let config: UserspaceConfig;
  try {
    config = await userspace_config_loader();
  } catch (err) {
    if (err.code === "ENOENT") {
      // Doesn't exist
      logger.info("Generating config...");
      await writeFile(DEFAULT_USERSPACE_CONFIG, YAML.stringify(default_userspace_config));
      config = default_userspace_config;
    } else {
      logger.err(`Error accesing userspace config file (${DEFAULT_USERSPACE_CONFIG})!`);
      logger.throw(err);
    }
  } finally {
    // Verify OOBE
    if (config.oobe && !argv.force) {
      // Run before
      logger.info("OOBE has been run before.");
    } else {
      // Run OOBE
      // Step 1: Fetch Software
      await fetch_software(argv);
      logger.info("OOBE done!");
      // DONE!
      config.oobe = true;
      logger.debug("Updating userspace config...")
      await writeFile(DEFAULT_USERSPACE_CONFIG, YAML.stringify(default_userspace_config));
    }
  }
}