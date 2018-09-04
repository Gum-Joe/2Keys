"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @overview Logging module for 2Keys, from https://github.com/Gum-Joe/tara
 * @module logger
 */
const chalk_1 = __importDefault(require("chalk"));
const constants_1 = require("./constants");
class Logger {
    constructor(args) {
        this.args = args || { name: "logger" };
        this.argv = process.argv;
        this.isDebug = this.argv.includes("--debug") || this.argv.includes("--verbose") || this.argv.includes("-v") || process.env.DEBUG === "true";
        this.chalk = new chalk_1.default.constructor();
    }
    // Logger methods
    /**
     * Basic Logger
     * @param level {String} Log Level
     * @param colour {String} colour of string
     * @param text {String} Text to log
     * @param type {WINDOW_TYPE|PROCESS_TYPE} What sent the log (window or main process)
     * @param args {LoggerArgs} Logger args
     * @private
     */
    _log(level, colour, text, type = this.type, args = this.args) {
        if (!this.argv.includes("--silent")) {
            // Add prefix
            let prefix = "";
            if (args.hasOwnProperty("name")) {
                prefix = this.chalk.magenta(args.name) + " "; // eslint-disable-line prefer-template
            }
            console.log(`${prefix}${this.chalk[colour](level)} ${text}`);
        }
    }
    /*
     * Info method
     * @public
     * @color green
     */
    info(text) {
        this._log("info", "green", text);
    }
    /*
     * Warn method
     * @public
     * @color green
     */
    warn(text) {
        if (!this.argv.includes("--silent")) {
            // Add prefix
            let prefix = "";
            if (this.args.hasOwnProperty("name")) {
                prefix = this.chalk.magenta(this.args.name) + " "; // eslint-disable-line prefer-template
            }
            console.warn(`${prefix}${this.chalk.yellow("warn")} ${text}`);
        }
    }
    /*
     * Error method
     * @color green
     * @public
     */
    err(text) {
        if (!this.argv.includes("--silent")) {
            // Add prefix
            let prefix = "";
            if (this.args.hasOwnProperty("name")) {
                prefix = this.chalk.magenta(this.args.name) + " "; // eslint-disable-line prefer-template
            }
            console.error(`${prefix}${this.chalk.red("err")} ${text}`);
        }
    }
    /*
     * Debug/verbose method
     * @color green
     * @public
     */
    debug(text) {
        this._log(constants_1.DEBUG, "cyan", text);
    }
    /*
     * Throw an Error
     * @param err {Error} Error to throw
     * @throw Error
     * @public
     */
    throw(err) {
        this.throw_noexit(err);
        process.exit(1);
    }
    /**
     * Throw without exit method
     * @colour red
     * @param err {Error} error to throw
     * From Bedel
     * @public
     */
    throw_noexit(err) {
        if (!this.argv.includes("--silent")) {
            this.err("");
            this.err(`${err.stack.split("\n")[0]}`);
            this.err("");
            if (this.isDebug || process.env.NODE_ENV !== "production") {
                this.err("Full error:");
                this.err("");
                let e = 0;
                for (e of err.stack.split("\n")) {
                    this.err(e);
                }
            }
            this.err("");
        }
    }
}
exports.default = Logger;
//# sourceMappingURL=logger.js.map