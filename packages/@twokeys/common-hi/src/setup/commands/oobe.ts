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
 * Runs OOBE
 * @packageDocumentation
 */
import path from "path";
import { promises as fs } from "fs";
import mkdirp from "mkdirp";
import { loadMainConfig, stringifyMainConfig } from "@twokeys/core/lib/config";
import { CodedError } from "@twokeys/core";
import { TWOKEYS_MAIN_CONFIG_DEFAULT_PATH } from "@twokeys/core/lib/constants";
import { MainConfig } from "@twokeys/core/lib/interfaces";
import { AddOnsRegistry, SoftwareRegistry } from "@twokeys/addons";
import { CommandFactory, PromiseCommand } from "../../common";
import { IOOBEConfig, OOBEConfig } from "../../../bundled/protobuf/compiled";
import * as errorCodes from "../util/errors";
import packageJSON from "../../../package.json";
import setStaticIPv4Address from "../util/setIPv4";

/**
 * Runs OOBE, setting up the main config needed for 2Keys.
 * @see TWOKEYS_MAIN_CONFIG_DEFAULT_PATH for the path to config
 * @see MainConfig for config schema
 */
const oobe: PromiseCommand<IOOBEConfig> = async (twokeys, config): Promise<void> => {
	twokeys.logger.info("Starting OOBE....");
	twokeys.logger.status("Setting up 2Keys");
	if (!config.didAcceptLicense) {
		throw new CodedError("You did not accept the license agreement. Therefore setup is unable to proceed.", errorCodes.DID_NOT_ACCEPT_LICENSE);
	}

	twokeys.logger.substatus("Creating 2Keys main config");
	twokeys.logger.info("Checking if OOBE has been ran before...");
	const logger = twokeys.logger;
	try {
		const serverConfig = await loadMainConfig(TWOKEYS_MAIN_CONFIG_DEFAULT_PATH);
		if (serverConfig.oobe && !config.options?.force) { // If force is false, and OOBE in the config is true, OOBE has already been done and we can't redo it
			logger.prompts.warning("Not running OOBE as main config already exists and says oobe has been ran.", {
				buttons: ["Ok"],
				defaultButton: 0,
			});
			return;
		} else {
			const { response } = await logger.prompts.warning("Found existing main config. It will be overwritten. Continue?", {
				defaultButton: 0,
			});
			// Untestable code
			if (response !== 0) {
				throw new CodedError("Main config already existed. Unable to proceed.", errorCodes.CONFIG_ALREADY_EXISTS);
			}
			// else, proceed and overwrite
		}
	} catch (err) {
		logger.debug("Got error reading config file:");
		logger.debug(err.message);
		if (err.code === "ENOENT") {
			twokeys.logger.info("No config found, assuming oobe has not been ran.");
		} else if (err instanceof CodedError) {
			throw err;
		} else {
			twokeys.logger.err(`Some other error was encountered accessing main config at ${TWOKEYS_MAIN_CONFIG_DEFAULT_PATH}`);
			throw new Error(`Eror getting main config at ${TWOKEYS_MAIN_CONFIG_DEFAULT_PATH}: ${err.message}`);
		}
	}

	logger.info(`Generating and writing server config for 2Keys version ${packageJSON.version}...`);
	const configToWrite: MainConfig = {
		name: config.pcName,
		version: packageJSON.version,
		registry_root: config.registryRoot,
		oobe: false, // OOBE not yet done
		network: {
			adapter: config.networkAdapter,
			ipv4: config.ipv4Address,
		}
	};
	logger.debug("Creating config dir...");
	await mkdirp(path.dirname(TWOKEYS_MAIN_CONFIG_DEFAULT_PATH));
	logger.debug(`Writing config to ${TWOKEYS_MAIN_CONFIG_DEFAULT_PATH}...`);
	await fs.writeFile(TWOKEYS_MAIN_CONFIG_DEFAULT_PATH, stringifyMainConfig(configToWrite));
	logger.info("Config written.");

	// Set IP address
	// Provided noIpv4set is false
	if (!(config.options?.no_IPv4Set)) {
		await setStaticIPv4Address(twokeys, {
			networkAdapter: config.networkAdapter,
			ipv4: config.ipv4Address,
		});
	} else {
		logger.warn("Not setting a static IPv4 address because --no-ipv4-set was passed");
	}

	// Create registry
	logger.substatus("Creating add-ons registry");
	await AddOnsRegistry.createNewRegistry(configToWrite.registry_root, {
		Logger: twokeys.LoggerConstructor,
	});
	logger.substatus("Creating software registry");
	await SoftwareRegistry.createSoftwareRegistry(configToWrite.registry_root, undefined, twokeys.LoggerConstructor);

	// Install stuff
	logger.status("Installing add-ons");
	logger.debug("Loading registry...");
	const registry = new AddOnsRegistry(configToWrite.registry_root, {
		Logger: twokeys.LoggerConstructor,
	});
	for (const addOn of config.addonInstallList || []) {
		logger.substatus(`Installing add-on ${addOn}...`);
		await registry.install(addOn);
	}

	logger.status("Finishing up");
	configToWrite.oobe = true;
	await fs.writeFile(TWOKEYS_MAIN_CONFIG_DEFAULT_PATH, stringifyMainConfig(configToWrite));
	logger.info("Done.");
};

export default CommandFactory.wrapCommand(oobe, "oobe", OOBEConfig);