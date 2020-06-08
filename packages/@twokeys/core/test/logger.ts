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
/* eslint-disable @typescript-eslint/ban-ts-ignore */
/**
 * Tests for the logger
 */

import { expect } from "chai";
import Logger from "../src/logger";
import { Instance } from "chalk";

const chalk = new Instance({
	level: 3
});

describe("Logger tests", () => {
	describe("Constructor", () => {
		it("should use our custom logger", (done) => {
			const logFunc = (): void => {
				done();
			};
			const logger = new Logger({ name: "TEST", argv: ["--debug"], loggingMethods: {
				log: logFunc,
				warn: logFunc,
				error: logFunc,
			}});
			logger.isSilent = false;
			// dew it
			logger.info("should call done");
		});
		describe(".isDebug", () => {
			it("should do isDebug if argv includes --debug", () => {
				const logger =  new Logger({ name: "TEST", argv: ["--debug"] });
				// @ts-ignore
				expect(logger.argv).to.include("--debug");
				expect(logger.isDebug).to.be.true;
			});
			it("should do isDebug if argv includes --verbose", () => {
				const logger = new Logger({ name: "TEST", argv: ["--verbose"] });
				// @ts-ignore
				expect(logger.argv).to.include("--verbose");
				expect(logger.isDebug).to.be.true;
			});
			it("should do isDebug if argv includes -v", () => {
				const logger = new Logger({ name: "TEST", argv: ["-v"] });
				// @ts-ignore
				expect(logger.argv).to.include("-v");
				expect(logger.isDebug).to.be.true;
			});
			it("should do isDebug if TWOKEYS_DEBUG is true", () => {
				process.env.TWOKEYS_DEBUG = "true";
				const logger = new Logger({ name: "TEST" });
				// @ts-ignore
				expect(logger.isDebug).to.be.true;
			});
			it("should do isDebug if NODE_ENV is development and TWOKEYS_DEBUG is not false", () => {
				process.env.TWOKEYS_DEBUG = "NOT_FALSE";
				process.env.NODE_ENV = "development";
				const logger = new Logger({ name: "TEST" });
				// @ts-ignore
				expect(logger.isDebug).to.be.true;
			});
			it("should not do isDebug if NODE_ENV is development but TWOKEYS_DEBUG is false", () => {
				process.env.TWOKEYS_DEBUG = "false";
				process.env.NODE_ENV = "development";
				const logger = new Logger({ name: "TEST" });
				// @ts-ignore
				expect(logger.isDebug).to.be.false;
			});
		});

		describe("Using colour (chalkOpts)", () => {
			const TEST_STR = "TEST_STR";
			it("should use color when TWOKEYS_USE_COLOUR is true", () => {
				process.env.TWOKEYS_USE_COLOUR = "true";
				const logger = new Logger({ name: "TEST" });
				// @ts-ignore
				expect(logger.chalk.green(TEST_STR)).to.not.equal(TEST_STR);
			});
			it("should use color when TWOKEYS_USE_COLOUR is false but --color is given", () => {
				process.env.TWOKEYS_USE_COLOUR = "false";
				const logger = new Logger({ name: "TEST", argv: ["--color"] });
				// @ts-ignore
				expect(logger.chalk.green(TEST_STR)).to.not.equal(TEST_STR);
			});
			it("should NOT use color regarless of environment vars when --no-color given", () => {
				process.env.TWOKEYS_USE_COLOUR = "true";
				const logger = new Logger({ name: "TEST", argv: ["--no-color"] });
				// @ts-ignore
				expect(logger.chalk.green(TEST_STR)).to.equal(TEST_STR);
			});
			it("should NOT use color regarless of cli args when --no-color given", () => {
				process.env.TWOKEYS_USE_COLOUR = "false";
				const logger = new Logger({ name: "TEST", argv: ["--color", "--no-color"] });
				// @ts-ignore
				expect(logger.chalk.green(TEST_STR)).to.equal(TEST_STR);
			});
			it("should NOT use color regarless of cli args or env vars when --no-color given", () => {
				process.env.TWOKEYS_USE_COLOUR = "true";
				const logger = new Logger({ name: "TEST", argv: ["--color", "--no-color"] });
				// @ts-ignore
				expect(logger.chalk.green(TEST_STR)).to.equal(TEST_STR);
			});
			
		});
	});

	describe("_log", () => {
		const LOGGER_NAME = "test2";
		const logger = new Logger({ name: LOGGER_NAME, argv: [] });
		logger.isSilent = false;
		it("should return a logging string, and use our custom logger", (done) => {
			// @ts-ignore
			logger._log("info", "green", "HI", (str) => {
				expect(str.split(" ")).to.include.members([
					chalk.magenta(LOGGER_NAME),
					chalk.green("info"),
					"HI"
				]);
				done();
			});
		});
		it("should return a logging string without a prefix if no name is given", (done) => {
			// @ts-ignore
			logger._log("info", "green", "HI", (str) => {
				expect(str.split(" ")).to.not.include.members([
					chalk.magenta(LOGGER_NAME)
				]);
				done();
			// @ts-ignore
			}, {} /* So there is no name */);
		});
		it("should not log stuff if isSilent is true", (done) => {
			logger.isSilent = true;
			// @ts-ignore
			logger._log("info", "green", "HI", () => {
				done(new Error("Logged when it was not supposed to!"));
			});
			done();
		});
	});

	describe("Individual methods", () => {
		const LOG_PREFIX = "testMethods";
		const TEST_STR = "HELLOWORLD";
		
		it("info()", () => {
			const loggingMethods = {
				log: (str): void => {
					expect(str.split(" ")).to.include.members([
						chalk.magenta(LOG_PREFIX),
						chalk.green("info"),
						TEST_STR
					]);
				}
			};
			const logger = new Logger({
				name: LOG_PREFIX,
				// @ts-ignore
				loggingMethods: loggingMethods,
			});
			logger.isSilent = false;
			logger.info(TEST_STR);
		});

		it("debug(): should log when isDebug is true", () => {
			const loggingMethods = {
				log: (str): void => {
					expect(str.split(" ")).to.include.members([
						chalk.magenta(LOG_PREFIX),
						chalk.cyan("debug"),
						TEST_STR
					]);
				}
			};
			const logger = new Logger({
				name: LOG_PREFIX,
				// @ts-ignore
				loggingMethods: loggingMethods,
			});
			logger.isSilent = false;
			logger.isDebug = true;
			logger.debug(TEST_STR);
		});

		it("debug(): should NOT log when isDebug is false ", (done) => {
			const loggingMethods = {
				log: (): void => {
					done(new Error("Expected debug logging not to happen!"));
				}
			};
			const logger = new Logger({
				name: LOG_PREFIX,
				// @ts-ignore
				loggingMethods: loggingMethods,
			});
			logger.isSilent = false;
			logger.isDebug = false;
			logger.debug(TEST_STR);
			done();
		});

		it("warn()", () => {
			const loggingMethods = {
				warn: (str): void => {
					expect(str.split(" ")).to.include.members([
						chalk.magenta(LOG_PREFIX),
						chalk.yellow("warn"),
						TEST_STR
					]);
				}
			};
			const logger = new Logger({
				name: LOG_PREFIX,
				// @ts-ignore
				loggingMethods: loggingMethods,
			});
			logger.isSilent = false;
			logger.warn(TEST_STR);
		});

		it("err()", () => {
			const loggingMethods = {
				error: (str): void => {
					expect(str.split(" ")).to.include.members([
						chalk.magenta(LOG_PREFIX),
						chalk.red("err"),
						TEST_STR
					]);
				}
			};
			const logger = new Logger({
				name: LOG_PREFIX,
				// @ts-ignore
				loggingMethods: loggingMethods,
			});
			logger.isSilent = false;
			logger.err(TEST_STR);
		});
	});
});