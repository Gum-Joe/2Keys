/**
Copyright 2018 Kishan Sambhi

This file is part of 2Keys.

2Keys is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

2Keys is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
*/
/**
 * @overview Logging module for 2Keys, from https://github.com/Gum-Joe/tara
 * @module logger
 */
import chalk, { Chalk } from "chalk";
import { Logger as LoggerArgs, LoggerTypes } from "./interfaces";
import { DEBUG } from "./constants";

export default class Logger {
  private args: LoggerArgs;
  private argv: string[];
  private isDebug: boolean;
  private chalk: Chalk;
  public isSilent: boolean;
  constructor(args: LoggerArgs) {
    this.args = args || { name: "logger" };
    this.argv = process.argv;
    this.isDebug = this.argv.includes("--debug") || this.argv.includes("--verbose") || this.argv.includes("-v") || process.env.DEBUG === "true";
    this.chalk = new chalk.Instance();
    this.isSilent = this.argv.includes("--silent") || process.env.NODE_ENV === "test";
  }

  // Logger methods
  /**
   * Basic Logger
   * @param level {String} Log Level
   * @param colour {String} colour of string
   * @param text {String} Text to log
   * @param args {LoggerArgs} Logger args
   * @private
   */
  private _log(level: string, colour: string, text: string, args: LoggerArgs = this.args) {
    if (!this.isSilent) {
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
  public info(text: string) {
    this._log("info", "green", text);
  }

  /*
   * Warn method
   * @public
   * @color green
   */
  public warn(text: string) {
    if (!this.isSilent) {
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
  public err(text: string) {
    if (!this.isSilent) {
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
  public debug(text: string) {
    this._log(DEBUG, "cyan", text);
  }

  /*
   * Throw an Error
   * @param err {Error} Error to throw
   * @throw Error
   * @public
   */
  public throw(err: Error) {
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
  public throw_noexit(err: Error) {
    if (!this.isSilent) {
      this.err("");
      this.err(`${err.message}`);
      this.err("");
      if (this.isDebug || process.env.NODE_ENV !== "production") {
        if (typeof err.stack !== "undefined") {
          this.err("Full error:");
          this.err("");
          let e: any = 0;
          for (e of err.stack.split("\n")) {
            this.err(e);
          }
        }
      }
      this.err("");
    }
  }

}