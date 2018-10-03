/**
 * @overview OOBE entry point
 */
import { Arguments } from "yargs";
import Logger from "../util/logger";

const logger = new Logger({
  name: "oobe",
})

export default function run_oobe(argv: Arguments) {
  logger.info("Starting OOBE...");
}