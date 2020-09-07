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
 * Creates a new detector
 * @packageDocumentation
 */
import { promises as fs } from "fs";
import { PromiseCommand, CommandFactory } from "../../common";
import { NewDetector } from "../protobuf/detector_pb";
import { AddOnsRegistry } from "@twokeys/addons/src";
import { loadClientConfig, loadMainConfig, stringifyClientConfig } from "@twokeys/core/lib/config";
import { TWOKEYS_CLIENTS_CONFIG_ROOT } from "@twokeys/core/lib/constants";
import TwoKeysForCommands from "../../common/twokeys";
import { join } from "path";
import { ClientConfig, ConfigUtils, MakeKeysOptional } from "@twokeys/core/lib/interfaces";

/** Gets path to client config */
export function getClientConfigPath(root: string, uuid: string) {
	return join(root, `client-${uuid}.yml`);
}

/**
 * Writes a client config to {@link TWOKEYS_CLIENTS_CONFIG_ROOT} as name `client-${config.id}.yml`
 * @param twokeys TwoKeys object
 * @param uuid UUID of client
 * @param configYAML YAML stringfied config
 */
export function writeClientConfig(twokeys: TwoKeysForCommands, uuid: string, configYAML: string): Promise<void> {
	const filename = getClientConfigPath(TWOKEYS_CLIENTS_CONFIG_ROOT, uuid);
	twokeys.logger.debug(`Writing config to ${filename}...`);
	return fs.writeFile(filename, configYAML);
}

export const newDetector: PromiseCommand<NewDetector.AsObject> = async (twokeys, config) => {
	const { logger } = twokeys;
	logger.status("Creating new detector");
	logger.info(`Creating new detector of name ${config.name}`);
	logger.substatus("Loading main config");
	const mainConfig = await loadMainConfig();
	logger.substatus("Loading registry");
	const registry = new AddOnsRegistry(mainConfig.registry_root, {
		Logger: twokeys.LoggerConstructor,
	});
	await registry.initDB();
	logger.substatus("Loading controller");
	const controller = await registry.loadDetector(config.controller);
	logger.debug("Controller loaded");

	logger.substatus("Generating config");
	logger.debug("Parsing config...");
	// Decode config
	const detectorConfigDecoded = JSON.parse(config.config) as unknown;
	logger.debug("Running controller function to generate config...");
	const controllerConfig = controller.call(controller.setup.setupNewClient.generateConfig, detectorConfigDecoded);
	const fullConfig: MakeKeysOptional<ClientConfig, "write"> = {
		id: config.id,
		name: config.name,
		controller: config.controller,
		controllerConfig,
		write: undefined,
	};
	// HACK: Would prefer type checking here, to check all deletes are manually done, but couldn't get that to work
	const keys: Array<keyof ConfigUtils> = ["write"];
	// Delete everything related to utils
	for (const key of keys) {
		delete fullConfig[key]; // Thankfully this does not affect `config` 
	}
	logger.info("Writing config...");
	logger.debug("Stringifying...");
	await writeClientConfig(twokeys, config.id, stringifyClientConfig(fullConfig));

	logger.substatus("Handing over to controller add-on for setup");
	await controller.call(controller.setup.setupNewClient.setup, await loadClientConfig(getClientConfigPath(TWOKEYS_CLIENTS_CONFIG_ROOT, fullConfig.id)));
};

export default CommandFactory.wrapCommand(newDetector, "newClient");