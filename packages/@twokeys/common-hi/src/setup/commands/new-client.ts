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
import { ClientConfig } from "@twokeys/core/lib/interfaces";
import getClientConfigPath from "@twokeys/core/lib/getClientConfigPath";
import getClientRootFromConfig from "@twokeys/core/lib/getClientRootFromConfig";

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
	const controller = await registry.loadDetector(config.controller, {
		clientRoot: getClientRootFromConfig(config),
	});
	logger.debug("Controller loaded");

	logger.substatus("Generating config");
	logger.debug("Parsing config...");
	// Decode config
	const detectorConfigDecoded = JSON.parse(config.config) as unknown;
	logger.debug("Running controller function to generate config...");
	const controllerConfig = controller.call(controller.setup.setupNewClient.generateConfig, detectorConfigDecoded);
	const fullConfig: ClientConfig = {
		id: config.id,
		name: config.name,
		controller: config.controller,
		controllerConfig,
	};
	logger.info("Writing config...");
	logger.debug("Stringifying...");
	await writeClientConfig(twokeys, config.id, stringifyClientConfig(fullConfig));

	logger.substatus("Handing over to controller add-on for setup");
	await controller.call(controller.setup.setupNewClient.setup, await loadClientConfig(getClientConfigPath(TWOKEYS_CLIENTS_CONFIG_ROOT, fullConfig.id)));

};

export default CommandFactory.wrapCommand(newDetector, "newClient");


