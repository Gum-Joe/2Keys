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
import { ClientConfig } from "@twokeys/core/lib/interfaces";
import { ClientConfigHere } from "../../config";
import { VM_ASSETS_ROOT } from "../../constants";
import { generateProvisionScript, PROVISION_CONFIG_TEMPLATE } from "./provision";
import { updateVagrantFile, updateVMLaunchFiles } from "./template-updates";
import { startVM } from "./vm";

/**
 * Function to setup a new client
 */
export const newClient: DetectorPromisedTaskFunction<ClientConfig<ClientConfigHere>> = async (twokeys, config) => {
	twokeys.logger.status("Setting up a new VM");
	// NOTE: The install of this module means vagrant etc was installed, so it's fine to just assume they are installed
	// 1: Create base files (from templates)
	twokeys.logger.status("Creating files");
	twokeys.logger.substatus("Copying template directory");
	const copier = new ContentCopier(VM_ASSETS_ROOT, twokeys.properties.clientRoot, {
		Logger: twokeys.LoggerConstructor,
	});
	await copier.copyContents();
	twokeys.logger.substatus("Filling out templates");
	await updateVagrantFile(twokeys, config.controllerConfig);
	await updateVMLaunchFiles(twokeys, config.controllerConfig);

	// 1.1: Create provision config, which is fed into twokeys on the client to set the software up
	await generateProvisionScript(twokeys, config);

	// TODO: Add to startup (once certain issues are fixed)
	// if (config.controllerConfig.perms.addToStartup) {
	// 	twokeys.logger.substatus("Adding startup script launch.vbs to startup");
	// 	await twokeys.utils.symbolLinkToStartup(join(twokeys.properties.clientRoot, VM_LAUNCH_VBS_FILE_DEST));
	// }
	// TODO: Handle auto update of OS setup 
	twokeys.logger.warn("Adding to startup is currently disabled in this release due to VBox preventing host shut down if VM is not stopped.");
	// DONE!
	// 2: Adjust Ansible config
	// 3: Run `vagrant up` & handle errors
	await startVM(twokeys, config.controllerConfig);

	// 4: SSH in and validate 2Keys is installed; copy client config & configure shares (run 2Keys client init)
};

export default newClient;
