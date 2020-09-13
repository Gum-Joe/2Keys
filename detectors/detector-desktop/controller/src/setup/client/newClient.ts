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

import { DetectorPromisedTaskFunction } from "@twokeys/addons";
import ContentCopier from "@twokeys/addons/lib/util/copy-contents";
import type { AddConfigUtils, ClientConfig } from "@twokeys/core/lib/interfaces";
import type { ClientConfigHere } from "../../config";
import { VM_ASSETS_ROOT } from "../../constants";
import { updateVagrantFile } from "./updateTemplates";

/**
 * Function to setup a new client
 */
const newClient: DetectorPromisedTaskFunction<AddConfigUtils<ClientConfig<ClientConfigHere>>> = async (twokeys, config) => {
	twokeys.logger.status("Setting up a new VM");
	// TODO: Action List
	// NOTE: The install of this module means vagrant etc was installed, so it's fine to just assume they are installed
	// 1: Create base files (from templates)
	twokeys.logger.status("Creating files");
	twokeys.logger.substatus("Copying template directory");
	const copier = new ContentCopier(VM_ASSETS_ROOT, twokeys.properties.clientRoot, {
		Logger: twokeys.LoggerConstructor,
	});
	await copier.copyContents();
	twokeys.logger.substatus("Filling out templates");
	updateVagrantFile(twokeys, config.controllerConfig);
	// DONE!
	// 2: Adjust Ansible config
	// 3: Run `vagrant up` & handle errors
	// 4: SSH in and validate 2Keys is installed; copy client config & configure shares (run 2Keys client init)
};

export default newClient;