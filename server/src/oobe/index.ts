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