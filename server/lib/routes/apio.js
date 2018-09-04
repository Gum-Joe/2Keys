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
const logger_1 = __importDefault(require("./util/logger"));
const logger = new logger_1.default({
    name: "api",
});
const router = express_1.Router();
/**
 * Returns the config for the 2Keys project
 */
router.get("/api/get/config", (res, req, next) => {
    logger.debug("Sending a config copy as JSON...");
    fs_1.readFile(path_1.join(process.cwd(), "config.yml"), (err, data) => {
        if (err)
            throw err;
        const data_to_send = JSON.stringify(yaml_1.default.parse(data));
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.send(data_to_send);
    });
});
//# sourceMappingURL=apio.js.map