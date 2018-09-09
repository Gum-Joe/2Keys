/**
 * @overview Main routes of 2Keys server
 */
import { Router } from "express";
import { readFile } from "fs";
import { join } from "path";
import YAML from "yaml";
import Logger from "../util/logger";

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
router.post("/post/trigger", (req, res, next) => {
  /**
   * 1: Get hotkey function from config
   * 2: Execute C++ bindings with #Include <root of keyboard>; function()
   */
});

export default router;
