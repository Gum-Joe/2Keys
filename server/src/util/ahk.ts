/**
 * @overview Handler for autohotkey running
 */
import * as fs from "fs";
import { promisify } from "util";
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
  const old_cwd: string = process.cwd()
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
      logger.debug(`#Include ${file}; ${func}()`);
      try {
        // TODO: Replace AHK_LIB_PATH with a getAhkDLL()
        const ahk_run = ahk.run_ahk_text(AHK_LIB_PATH, `#Include ${file}\n${func}()`);
        if (typeof ahk_run != null) {
          // ERROR!
          const error: Error = new Error(`Error running AutoHotkey: ${ahk_run.message}.  Code: ${ahk_run.code}`)
          logger.throw_noexit(error);
        }
        // Change back to old CWD
        process.chdir(old_cwd);
      } catch (err) {
        logger.throw_noexit(err);
      }
    } else {
      logger.err(`Function ${func} is invalid for regexp "${regexp}"`);
    }
  }
}