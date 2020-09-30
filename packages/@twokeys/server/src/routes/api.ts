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
 * Main routes of 2Keys server
 * @packageDocumentation
 */
import { Router } from "express";
import { readFile, writeFile } from "fs";
import { join } from "path";
import YAML from "yaml";
import { config_loader } from "../util/config";
import Logger from "../util/logger";
import {EvDevValues } from "../util/interfaces";
import { run_hotkey, fetch_hotkey } from "../util/ahk";
import { CONFIG_FILE } from "../util/constants";
import { BaseHotkeyTypeSingle, DetectorConfig, Hotkey, HotkeyTypeKeypressValue, HotkeyTypeSingle, Keyboard, ProjectConfig } from "@twokeys/core/lib/interfaces";
import { loadMainConfig } from "@twokeys/core/lib/config";
import { TWOKEYS_MAIN_CONFIG_DEFAULT_PATH } from "@twokeys/core/lib/constants";
import { AddOnsRegistry, ExecutorExecConfig } from "@twokeys/addons";
import { loadDetectors } from "./loadDetectors";
import { loadExecutors } from "./loadExecutors";
import { CodedError } from "@twokeys/core";
import { ERR_BAD_EVENT_TYPE } from "../util/errCodes";

export const logger: Logger = new Logger({
	name: "api",
});
const router = Router();

/**
 * Helper function to check if obeject has property
 */
function hasOwnProperty<T extends { [key: string]: any }, K extends keyof T>(obj: T, prop: K): boolean  {
	return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Needed so we can use async/await
 */
// TODO: Rate limiting of routes to prevent excessive FS access
// TODO: Remove deprecated routes
export default async function getAPI(projectConfig: ProjectConfig, projectDir: string): Promise<Router> {
	logger.info("Preparing server...");

	// 1: Load config
	// TODO: Watch for changes to project and reload everything
	logger.info("Loading root config...");
	const mainConfig = await loadMainConfig(TWOKEYS_MAIN_CONFIG_DEFAULT_PATH);
	logger.info("Loading add-ons...");
	const registry = new AddOnsRegistry(mainConfig.registry_root);

	// Load add-ons & run startup functions for detectors
	const detectors = await loadDetectors(projectConfig, projectDir, registry);
	const executors = await loadExecutors(registry, projectDir);

	/**
	 * Returns to config for the 2Keys project
	 */
	router.get("/get/config/project", (req, res) => {
		logger.info("Sending a config copy as JSON...");
		// We can rely on hot reload to ensure it is accurate
		res.statusCode = 200;
		res.json(mainConfig);
	});

	/**
	 * Returns config for a detector
	 */
	router.get("/get/config/detectors/:detector", (req, res) => {
		const detectorToGet = req. params.detector;
		logger.info(`Requested config for detector ${detectorToGet}`);
		if (detectors.has(detectorToGet)) {
			res.statusCode = 200;
			res.json(detectors.get(detectorToGet));
		} else {
			logger.info(`${detectorToGet} not found!`);
			res.statusCode = 404;
			res.json({
				message: "Not Found"
			});
		}
	});

	/**
 	 * Returns the config for the 2Keys project
		* @deprecated
 	 */
	router.get("/get/deprecated/config", (req, res, next) => {
		logger.debug("Sending a config copy as JSON...");
		logger.warn("/get/config is deprecated.");
		readFile(join(process.cwd(), "config.yml"), (err, data) => {
			if (err) {
				return next(err);
			}
			const data_to_send = JSON.stringify(YAML.parse(data.toString()));
			res.setHeader("Content-Type", "application/json");
			res.statusCode = 200;
			res.send(data_to_send);
		});
	});

	/**
	 * Trigger a hotkey
	 * 
	 * Provide these property:
	 * ```json
	 * {
	 * 	"hotkey": "^A" // hotkey code to find in keyboard
	 * 	"event": "up" | "down" | "hold" // OPTIONAL event type
	 * }
	 * ```
	 */
	router.post("/post/:detector/:keyboard/trigger", (req, res, next) => {
		const { detector: detectorName, keyboard: keyboardName } = req.params;
		logger.info(`Got trigger for detector ${detectorName}, keyboard ${keyboardName}`);

		logger.info("Validating POST body");
		if (!hasOwnProperty(req, "body") || typeof req.body !== "object" || typeof req.body.hotkey !== "string") {
			logger.err("Invalid POST body! Properties were missing!");
			res.statusCode = 422;
			res.json({
				message: "Invalid POST body! Properties were missing!",
			});
			return;
		}

		const hotkey = req.body.hotkey as string;
		const eventType: keyof HotkeyTypeKeypressValue = req.body.event || "down";
		if (eventType !== "up" && eventType !== "down" && eventType !== "hold") {
			logger.err("Bad event field given!");
			res.statusCode = 422;
			res.json({
				message: "Bad event field given!",
			});
			return;
		}

		// 1: Grab config
		logger.debug(`Grabbing config for detector ${detectorName}, keyboard ${keyboardName}...`);
		if (!detectors.has(detectorName)) {
			logger.err(`Detector ${detectorName} not found!`);
			res.statusCode = 404;
			res.json({
				message: "Detector Not Found"
			});
			return;
		}
		const detector = detectors.get(detectorName) as DetectorConfig;
		if (hasOwnProperty(detector.keyboards, keyboardName)) {
			logger.debug(`Keybaord ${keyboardName} found`)
			const keyboard = detector.keyboards[keyboardName];

			if (!hasOwnProperty(keyboard.hotkeys, hotkey)) {
				logger.err(`Hotkey ${hotkey} not found!`);
				res.statusCode = 404;
				res.json({
					message: "Hotkey Not Found"
				});
				return;
			}

			// eslint-disable-next-line no-inner-declarations
			function isMultiHotkey(hotkey: Hotkey): hotkey is HotkeyTypeKeypressValue {
				if (hasOwnProperty(hotkey, "up") || hasOwnProperty(hotkey, "down") || hasOwnProperty(hotkey, "hold")) {
					return true;
				} else {
					return false;
				}
			}

			// eslint-disable-next-line no-inner-declarations
			async function executeHotKey(hotkey: HotkeyTypeSingle, hotkeyCode: string, keyboard: Keyboard): Promise<void> {
				logger.info(`Executing hotkey ${hotkey}...`);
				const executorToCall = hotkey.executor || keyboard.executors.default;
				const configForExecutor: ExecutorExecConfig<{ [key: string]: any }> = {
					hotkey: {
						...(keyboard.executors[executorToCall] || {}), // Falback in case no config
						...hotkey,
					},
					hotkeyCode,
					executorDefaultConfig: (keyboard.executors[executorToCall] || {}),
					keyboard,
				};
				logger.debug(`Providing ${JSON.stringify(configForExecutor)} to executor`);
				if (!hasOwnProperty(executors, executorToCall)) {
					logger.err(`Executor ${executorToCall} not found installed!`);
					throw new CodedError("Executor to use not found!");
				}
				await executors[executorToCall].call(executors[executorToCall].execute, configForExecutor);
				return;
			}

			const theHotkey = keyboard.hotkeys[hotkey];
			if (isMultiHotkey(theHotkey)) {
				if (typeof theHotkey[eventType] !== "object") {
					return next(new CodedError(`Hotkey event ${eventType} not found!`, ERR_BAD_EVENT_TYPE));
				} else {
					executeHotKey(theHotkey[eventType] as HotkeyTypeSingle, hotkey, keyboard)
						.catch(next)
						.then(() => {
							logger.info("Execution done.");
						});
					// Send back to prevent timeout from long hotkeys
					res.statusCode = 200;
					res.json({
						message: "Run triggered",
					});
					res.end();
					return;
				}
			} else {
				// TODO: Execute on a different thread, because the server hangs and fails any in progress runs if it is still waiting for this
				executeHotKey(theHotkey, hotkey, keyboard)
					.catch(next)
					.then(() => {
						logger.info("Execution done.");
					});
				// Send back to prevent timeout from long hotkeys
				res.statusCode = 200;
				res.json({
					message: "Run triggered",
				});
				res.end();
				return;
			}

		} else {
			logger.err(`Keyboard ${keyboardName} not found!`);
			res.statusCode = 404;
			res.json({
				message: "Keyboard Not Found"
			});
			return;
		}

	});

	/**
	 * Trigger a hotkey
	 * Info to send:
	 * - keyboard: The keyboard name that has been pressed
	 * - hotkey: set of keys that have been pressed
	 * @deprecated
	 */
	router.post("/post/depreacted/trigger", async (req, res, next) => {
		/**
		 * 1: Get hotkey function from config
		 * 2: Execute C++ bindings with #Include <root of keyboard>; function()
		 */
		// Get vars
		const keyboard = req.body.keyboard;
		const hotkey_code = req.body.hotkey;
		const value: EvDevValues = Object.prototype.hasOwnProperty.call(req.body, "value") ? req.body.value : EvDevValues.Down;
		logger.debug(`Got keyboard ${keyboard} and hotkey ${hotkey_code}, with value ${value}`);
		// Parse config
		try {
			const fetched_hotkey = await fetch_hotkey(keyboard, hotkey_code); // Gets hotkey
			let func_to_run: string;

			// Use the value arg to select
			if (typeof fetched_hotkey.func === "object") {
				// Is an object
				logger.debug("Got a multi event hotkey.");
				// Select which function to run
				if (value === EvDevValues.Down) {
					func_to_run = fetched_hotkey.func.down;
				} else if (value === EvDevValues.Up) {
					func_to_run = fetched_hotkey.func.up;
				} else {
					// Stop exec as and error was encountered
					return next(new TypeError(`The request keyboard event value of ${value} is invalid.  Valid event values are: 0 (Up) & 1 (Down)`));
				}

				// Validate a function actually exists
				if (typeof func_to_run === "undefined") {
					// Ignore
					logger.warn(`Ignoring hotkey ${hotkey_code} of value ${value}, as no function to run exists`);
					res.statusCode = 404;
					res.send("Hotkey function not found");
					return;
				}
			} else {
				func_to_run = fetched_hotkey.func;
			}

			// Execute
			run_hotkey(fetched_hotkey.file, func_to_run);

			res.statusCode = 200;
			res.send("OK");
		} catch (err) {
			next(err); // Hand off to error handler
		}
	});

	/**
	 * Handles keyboard path update
	 */
	router.post("/post/update-keyboard-path", (req, res, next) => {
		const { keyboard, path } = req.body;
		logger.info(`Got update for ${keyboard}, path ${path}`);
		config_loader()
			.then((config) => {
				// Make changes
				config.keyboards[keyboard].path = path;
				// Write
				logger.debug("Writing config...");
				writeFile(CONFIG_FILE, YAML.stringify(config), (err) => {
					if (err) {
						return next(err);
					} else {
						res.statusCode = 200;
						res.send("OK");
					}
					res.end();
				});
			});
	});
	return router;
}
