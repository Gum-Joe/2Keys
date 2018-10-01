/**
 * @overview OOBE entry point
 */
import Logger from "../util/logger";

const logger = new Logger({
  name: "oobe",
})

export default function run_oobe() {
  logger.info("Starting OOBE...");
}