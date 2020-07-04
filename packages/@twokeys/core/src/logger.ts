/**
 * @license
 * Copyright 2020 Kishan Sambhi
 *
 * This file is part of 2Keys.
 *
 * 2Keys is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 2Keys is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * Logging module for 2Keys, from https://github.com/Gum-Joe/tara
 * @packageDocumentation
 */
import { Chalk } from "chalk";
import { LoggerArgs, LoggingMethods, defaultLoggingMethods } from "./interfaces";
import ProgressBar from "progress";
import Prompts from "./prompts";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Instance } = require("chalk");

export default class Logger {
	protected argv: string[];
	protected chalk: Chalk;
	public isDebug: boolean;
	public args: LoggerArgs;
	public isSilent: boolean;
	/** Methods used for logging. See type */
	public loggingMethods: LoggingMethods = defaultLoggingMethods;

	/** Prompts stuff */
	public prompts = new Prompts(this);

	constructor(args: LoggerArgs) {
		this.args = args;
		this.argv = args.argv || process.argv;
		this.isDebug = // Are any of these true????
			this.argv.includes("--debug") ||
			this.argv.includes("--verbose") ||
			this.argv.includes("-v") ||
			process.env.TWOKEYS_DEBUG === "true" ||
			(
				process.env.NODE_ENV === "development"
				&& process.env.TWOKEYS_DEBUG !== "false"
			);
		const chalkOpts = // if TWOKEYS_USE_COLOUR is true OR --color given, and provided --no-color is not there as well, color is enabled
			(
				process.env.TWOKEYS_USE_COLOUR === "true" ||
				this.argv.includes("--color")
			) && !this.argv.includes("--no-color") ?
				{ level: 3 } : { level: 0 }; // Development hack to enable colour in electron-forge
		this.chalk = new Instance(chalkOpts);
		this.isSilent = this.argv.includes("--silent") || process.env.NODE_ENV === "test";
		// Set logging methods
		if (Object.prototype.hasOwnProperty.call(this.args, "loggingMethods") && typeof this.args.loggingMethods !== "undefined") {
			this.loggingMethods = this.args.loggingMethods;
		}
	}

	// Logger methods
	/**
	 * Gets the logger prefix to put before text
	 * @param level {String} Log Level
	 * @param colour {String} colour of string
	 * @param args {LoggerArgs} Logger args
	 */
	protected _getPrefix(level: string, colour: string, args: LoggerArgs = this.args): string {
		// Add prefix
		let prefix = "";
		if (Object.prototype.hasOwnProperty.call(args, "name") && typeof args.name === "string") {
			prefix = this.chalk.magenta(args.name) + " "; // eslint-disable-line prefer-template
		}
		const today = new Date();
		return `${this.chalk.grey(`${today.toLocaleDateString("en-GB")} ${today.toLocaleTimeString("en-GB")}`)} ${prefix}${this.chalk[colour](level)}`;
	}
	/**
	 * Basic Logger
	 * @param level {String} Log Level
	 * @param colour {String} colour of string
	 * @param text {String} Text to log
	 * @param args {LoggerArgs} Logger args
	 * @param logger Custom logger to print with
	 */
	protected _log(level: string, colour: string, text: string, logger = this.loggingMethods.log, args: LoggerArgs = this.args): void {
		if (!this.isSilent) {
			logger(`${this._getPrefix(level, colour, args)} ${text}`);
		}
	}
	/**
	 * Info method
	 * @public
	 * @color green
	 */
	public info(text: string): void {
		this._log("info", "green", text);
	}

	/**
	 * Warn method
	 * @public
	 * @color green
	 */
	public warn(text: string): void {
		this._log("warn", "yellow", text, this.loggingMethods.warn);
	}
	/**
	 * Error method
	 * @color green
	 * @public
	 */
	public err(text: string): void {
		this._log("err", "red", text, this.loggingMethods.error);
	}
	
	/**
	 * Debug/verbose method
	 * @color green
	 * @public
	 */
	public debug(text: string): void {
		if (this.isDebug) { this._log("debug", "cyan", text); }
	}

	/**
	 * Throw an Error
	 * @param err {Error} Error to throw
	 * @throw Error
	 * @public
	 * @deprecated Please just throw your errors, and let 2Keys handle it.
	 */
	public throw(err: Error): void {
		this.warn("logger.throw() is depreacted.  Please just throw your errors, and let 2Keys handle it.");
		this.throw_noexit(err);
		process.exit(1);
	}

	/**
	 * Throw without exit method
	 * @colour red
	 * @param err {Error} error to throw
	 * From Bedel
	 * @public
	 * @deprecated Use {@link Logger.printError} instead
	 */
	public throw_noexit(err: Error): void { // eslint-disable-line @typescript-eslint/camelcase
		this.warn("logger.throw_noexit() is depreacted.  Please just throw your errors, and let 2Keys handle it, or use logger.printError().");
		this.printError(err);
	}

	/**
	 * Print out an error message, and the stack if isDebug is true.
	 * @colour red
	 * @param err Error to print
	 */
	public printError(err: Error): void {
		// Don't check for isSilent as _log checks for that
		this.err("");
		this.err(`${err.message}`);
		this.err("");
		if (this.isDebug) {
			if (typeof err.stack !== "undefined") {
				this.err("Full error:");
				this.err("");
				let e = "";
				for (e of err.stack.split("\n")) {
					this.err(e);
				}
			}
			this.err(""); // Spacing
		}
	}

	/** Create a progress bar */
	public createProgressBar(format: string, options: ProgressBar.ProgressBarOptions): ProgressBar {
		return new ProgressBar(`${this._getPrefix("info", "green")} ${format}`, options);
	}

	/**
	 * The below methods are supplememtary methods, designed to allow tasks that are being ran to update user on state.  See explanations below.
	 * These are overriden by the GUI in the install screen
	 */

	/**
	 * Used to log the main status of the task in progress, for example, the overarching task currently in progress.
	 * Here it just log to info, but will be overriden with a proper implementation for CLI and GUI
	 * @param message Us
	 */
	public status(message: string): void {
		this.info(message);
	}

	/**
	 * Used to log the status of a subtask in progress (i.e. part of the task that was logged with {@link Logger.statis})
	 * Here it just log to info, but will be overriden with a proper implementation for CLI and GUI
	 * @param message Us
	 */
	public substatus(message: string): void {
		this.info(message);
	}

}
