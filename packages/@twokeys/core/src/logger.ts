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
import { Logger as LoggerArgs } from "./interfaces";
import ProgressBar from "progress";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Instance } = require("chalk");

export default class Logger {
	private argv: string[];
	private chalk: Chalk;
	public isDebug: boolean;
	public args: LoggerArgs;
	public isSilent: boolean;
	constructor(args: LoggerArgs) {
		this.args = args || { name: "logger" };
		this.argv = process.argv;
		this.isDebug = this.argv.includes("--debug") || this.argv.includes("--verbose") || this.argv.includes("-v") || process.env.TWOKEYS_DEBUG === "true" || (process.env.NODE_ENV === "development" && process.env.TWOKEYS_DEBUG !== "false");
		const chalkOpts = (process.env.TWOKEYS_USE_COLOUR === "true" || this.argv.includes("--color")) && !this.argv.includes("--no-color") ? { level: 3 } : {}; // Development hack to enable colour in electron-forge
		this.chalk = new Instance(chalkOpts);
		this.isSilent = this.argv.includes("--silent") || process.env.NODE_ENV === "test";
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
		if (Object.prototype.hasOwnProperty.call(this.args, "name")) {
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
	protected _log(level: string, colour: string, text: string, logger = console.log, args: LoggerArgs = this.args): void {
		if (!this.isSilent) {
			logger(`${this._getPrefix(level, colour, args)} ${text}`);
		}
	}
	/*
	 * Info method
	 * @public
	 * @color green
	 */
	public info(text: string): void {
		this._log("info", "green", text);
	}

	/*
	 * Warn method
	 * @public
	 * @color green
	 */
	public warn(text: string): void {
		if (!this.isSilent) {
			this._log("warn", "yellow", text, console.warn);
		}
	}
	/*
	 * Error method
	 * @color green
	 * @public
	 */
	public err(text: string): void {
		if (!this.isSilent) {
			this._log("err", "red", text, console.error);
		}
	}

	/*
	 * Debug/verbose method
	 * @color green
	 * @public
	 */
	public debug(text: string): void {
		if (this.isDebug) { this._log("debug", "cyan", text); }
	}

	/*
	 * Throw an Error
	 * @param err {Error} Error to throw
	 * @throw Error
	 * @public
	 */
	public throw(err: Error): void {
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
	public throw_noexit(err: Error): void { // eslint-disable-line @typescript-eslint/camelcase
		if (!this.isSilent) {
			this.err("");
			this.err(`${err.message}`);
			this.err("");
			if (this.isDebug || process.env.NODE_ENV !== "production") {
				if (typeof err.stack !== "undefined") {
					this.err("Full error:");
					this.err("");
					let e = "";
					for (e of err.stack.split("\n")) {
						this.err(e);
					}
				}
			}
			this.err("");
		}
	}

	/** Create a progress bar */
	public createProgressBar(format: string, options: ProgressBar.ProgressBarOptions): ProgressBar {
		return new ProgressBar(`${this._getPrefix("info", "green")} ${format}`, options);
	}

}
