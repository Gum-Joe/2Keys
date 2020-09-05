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

import { PromiseCommand, CommandFactory } from "../../common";
import { NewDetector } from "../protobuf/detector_pb";
import { AddOnsRegistry } from "@twokeys/addons/src";
import { loadMainConfig } from "@twokeys/core/lib/config";

export const newDetector: PromiseCommand<NewDetector.AsObject> = async (twokeys, config) => {
	const { logger } = twokeys;
	logger.status("Creating new detector")
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
	// Decode config
	const detectorConfigDecoded = JSON.parse(config.config) as unknown;
	logger.substatus("Handing over to controller add-on");
	await controller.call(controller.setup.setupNewClient.setup, detectorConfigDecoded);
}

export default CommandFactory.wrapCommand(newDetector, "newDetector");