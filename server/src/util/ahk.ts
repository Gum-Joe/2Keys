/**
 * @overview Handler for autohotkey running
 */
import * as fs from "fs";
import { promisify } from "util";
import { config_loader } from "./config";
import { AHK_LIB_PATH } from "./constants";
import Logger from "./logger";


const ahk = require("../../build/Release/twokeys");
const logger: Logger = new Logger({ name: "ahk" });
const access = promisify(fs.access);

/**
 * 
 * @param file {String} File to get hotkeys from
 * @param func {String} Function to run from that file
 */
export async function run_hotkey(file: string, func: string): Promise<void> {
  // 1: Santise file input to prevent code injection
  // Check it exists
  try {
    await access(file, fs.constants.F_OK | fs.constants.S_IFREG);
  } catch (err) {
    logger.throw_noexit(err);
  } finally {
    // 2: Verify func ok
    // Check if matches FuncName() format
    const regexp: RegExp = /^[a-z0-9]+$/i; // From https://stackoverflow.com/questions/388996/regex-for-javascript-to-allow-only-alphanumeric
    if (regexp.test(func)) {
      // Yay! run the hotkey
      logger.info(`#Include ${file}\n${func}()`);
      ahk.run_ahk_text(AHK_LIB_PATH, `#Include ${file}\n${func}()`);
    } else {
      logger.err(`Function ${func} is invalid for regexp "${regexp}"`);
    }
  }
}