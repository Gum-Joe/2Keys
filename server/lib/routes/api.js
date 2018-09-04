"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @overview Main routes of 2Keys server
 */
const express_1 = require("express");
const fs_1 = require("fs");
const path_1 = require("path");
const yaml_1 = __importDefault(require("yaml"));
const logger_1 = __importDefault(require("../util/logger"));
const logger = new logger_1.default({
    name: "api",
});
const router = express_1.Router();
/**
 * Returns the config for the 2Keys project
 */
router.get("/get/config", (req, res, next) => {
    logger.debug("Sending a config copy as JSON...");
    fs_1.readFile(path_1.join(process.cwd(), "config.yml"), (err, data) => {
        if (err) {
            res.statusCode = 500;
            res.send(err.stack);
        }
        const data_to_send = JSON.stringify(yaml_1.default.parse(data.toString()));
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.send(data_to_send);
    });
});
exports.default = router;
//# sourceMappingURL=api.js.map