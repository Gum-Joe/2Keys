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
import { readFile, watchFile, writeFile } from "fs";
import { join } from "path";
import YAML from "yaml";
import { config_loader } from "../util/config";
import Logger from "../util/logger";
import {EvDevValues } from "../util/interfaces";
import { run_hotkey, fetch_hotkey } from "../util/ahk";
import { CONFIG_FILE } from "../util/constants";
import { DetectorConfig, ProjectConfig } from "@twokeys/core/lib/interfaces";
import { loadClientConfig, loadDetectorConfig, loadMainConfig } from "@twokeys/core/lib/config";
import { TWOKEYS_CLIENTS_CONFIG_ROOT, TWOKEYS_MAIN_CONFIG_DEFAULT_PATH } from "@twokeys/core/lib/constants";
import { getClientConfigPath, getClientRootFromConfig } from "@twokeys/core";
import { AddOnsRegistry, TWOKEYS_ADDON_TYPE_EXECUTOR } from "@twokeys/addons";

const logger: Logger = new Logger({
	name: "api",
});
const router = Router();

/**
 * Needed so we can use async/await
 */
export default async function getAPI(projectConfig: ProjectConfig, projectDir: string): Promise<Router> {
	logger.info("Preparing server...");
	// TODO: Watch for changes to project and reload everything
	logger.info("Loading root config...");
	const mainConfig = await loadMainConfig(TWOKEYS_MAIN_CONFIG_DEFAULT_PATH);
	logger.info("Loading add-ons...");
	const registry = new AddOnsRegistry(mainConfig.registry_root);

	// Run startup functions for detectors
	logger.info("Loading detectors...");
	const detectors = new Map<string, DetectorConfig>();

	logger.info("Listing detectors & generating map...");
	await Promise.all(projectConfig.detectors.map(async (detectorConfigPath) => {
		logger.debug("Loading a detector config...");
		const absoluteDetectorConfigPath = join(projectDir, detectorConfigPath);
		const detector = await loadDetectorConfig(absoluteDetectorConfigPath);
		detectors.set(detector.name, detector);

		logger.debug("Watching for changes");
		watchFile(absoluteDetectorConfigPath, () => {
			logger.info(`Changes detected to detector ${detector.name}! Reloading`);
			loadDetectorConfig(absoluteDetectorConfigPath)
				.then((newDetector) => {
					detectors.set(newDetector.name, newDetector);
					if (detector && (newDetector.name !== detector.name)) { // Detector may have been deleted from memeory, hence
						// Detector name change!
						logger.debug(`Detected a name change of detector ${detector.name} to ${newDetector.name}!`);
						detectors.delete(detector.name);
					}
				})
				.catch(err => {
					logger.err(`Error reloading detector ${detector.name}!`);
					logger.printError(err);
					// What else to do?
					throw err;
				});
		});
		return detector;
	}));

	logger.debug("Running startup actions...");
	const actionPromises: Array<Promise<void>> = [];
	for (const [detectorName, detectorConfig] of detectors.entries()) {
		logger.debug(`Adding startup task for ${detectorName}`);
		actionPromises.push((async (): Promise<void> => {
			logger.debug(`Loading client config for client ${detectorConfig.client.name}...`);
			const client = await loadClientConfig(getClientConfigPath(TWOKEYS_CLIENTS_CONFIG_ROOT, detectorConfig.client.id));
			const controller = await registry.loadDetector(client.controller, {
				projectDir,
				clientRoot: getClientRootFromConfig(client)
			});
			if (typeof controller.startup === "function") {
				logger.info(`Running startup actions for client ${client.name}, which has detector ${detectorName}`);
				await controller.call(controller.startup, {
					clientConfig: client,
					projectConfig,
					detectorConfig,
				});
			}
		})()); // Must call it so it is ran
	}
	logger.debug("Waiting for startup actions to finish...");
	logger.debug(JSON.stringify([...detectors]));
	await Promise.all(actionPromises);
	
	logger.info("Loading executors for use...");
	const executors = await registry.loadAllOfType(TWOKEYS_ADDON_TYPE_EXECUTOR);

	/**
 	 * Returns the config for the 2Keys project
 	 */
	router.get("/get/config", (req, res, next) => {
		logger.debug("Sending a config copy as JSON...");
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
	 * Info to send:
	 * - keyboard: The keyboard name that has been pressed
	 * - hotkey: set of keys that have been pressed
	 */
	router.post("/post/trigger", async (req, res, next) => {
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
