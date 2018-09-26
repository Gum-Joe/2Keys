/**
 * @overview Main routes of 2Keys server
 */
import { Router } from "express";
import { readFile } from "fs";
import { join } from "path";
import YAML from "yaml";
import { config_loader } from "../util/config";
import Logger from "../util/logger";
import { Config, Hotkey } from "../util/interfaces";
import { run_hotkey } from "../util/ahk";

const logger: Logger = new Logger({
  name: "api",
});
const router = Router();

/**
 * Returns the config for the 2Keys project
 */
router.get("/get/config", (req, res, next) => {
  logger.debug("Sending a config copy as JSON...");
  readFile(join(process.cwd(), "config.yml"), (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.send(err.stack);
    }
    const data_to_send = JSON.stringify(YAML.parse(data.toString()));
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.send(data_to_send);
  });
});

/**
 * Trigger a hotkey
 * Info to send:
 * - keyboard: The keyboard name that has been pressed
 * - key: set of keys that have been pressed
 */
router.post("/post/trigger", async (req, res, next) => {
  /**
   * 1: Get hotkey function from config
   * 2: Execute C++ bindings with #Include <root of keyboard>; function()
   */
  // Get vars
  const keyboard = req.body.keyboard;
  const hotkey_code = req.body.hotkey;
  logger.debug(`Got keyboard ${keyboard} and hotkey ${hotkey_code}`);
  // Parse config
  try {
    const config: Config = await config_loader();

    // Get hotkey func
    let func;
    const hotkey: string | Hotkey = config.keyboards[keyboard].hotkeys[hotkey_code];
    if (typeof hotkey !== "string") {
      // Object type
      func = hotkey.func;
    } else {
      func = hotkey;
    }
    const file = join(process.cwd(), config.keyboards[keyboard].dir, config.keyboards[keyboard].root);

    // Handle
    run_hotkey(file, func);

    res.statusCode = 200;
    res.send("OK")
  } catch (err) {
    logger.throw_noexit(err);
    res.statusCode = 500
    res.send(err.stack.toString());
  }
});

export default router;
