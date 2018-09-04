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

export default router;