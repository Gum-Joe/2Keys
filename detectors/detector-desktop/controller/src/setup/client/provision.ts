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
 * Contains the provision config template to use & function to create it
 * This is then ran through the detector via `twokeys -f provision.yml` to provision the detector for 2Keys
 * @packageDocumentation
 */
import { ClientSideProvisioningConfig as ProvisioningConfig } from "@twokeys/detector-desktop-schemas/types/client-side-provisioning-config";
import { TwoKeys } from "@twokeys/addons";
import { ClientConfig } from "@twokeys/core/lib/interfaces";
import { ClientSideProvisioningConfig } from "@twokeys/detector-desktop-schemas/types/client-side-provisioning-config";
import { ClientConfigHere } from "../../config";
import { PROVISION_CONFIG_STORAGE, VM_ASSETS_ROOT, VM_MOUNT_CLIENT_CONFIG, VM_MOUNT_CONFIGS, VM_MOUNT_PROJECTS } from "../../constants";
import { promises as fs } from "fs";
import { stringifyAnyConfig } from "@twokeys/core/lib/config";
import { join } from "path";

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
const packageJSON = require("../../../package.json");

/**
 * Template for provisioning the client with `twokeys -f config/provision.yml`
 */
export const PROVISION_CONFIG_TEMPLATE: { twokeys: ProvisioningConfig["twokeys"]; client: {} } = {
	twokeys: {
		version: packageJSON.version,
		type: "CLIENT_SETUP",
		createdBy: "CONTROLLER",
	},

	client: {} // These details are left to individual clients
};

/**
 * Generates config used to provision the detector client-side
 * @see ClientSideProvisioningConfig
 * @param twokeys TwoKeys object
 * @param config Client config (passed to add-on by 2Keys)
 */
export async function generateProvisionScript(twokeys: TwoKeys<"detector">, config: ClientConfig<ClientConfigHere>) {
	twokeys.logger.substatus("Creating provision script");
	const provisionConfigFile: ClientSideProvisioningConfig = {
		...PROVISION_CONFIG_TEMPLATE,
		client: {
			name: config.name,
			id: config.id,
			roots: {
				config: VM_MOUNT_CONFIGS,
				projects: VM_MOUNT_PROJECTS,
				clientConfigName: VM_MOUNT_CLIENT_CONFIG,
			},
			server: {
				ipv4: (await twokeys.configs.getMainConfig()).network.ipv4,
			}
		}
	};
	// Write it
	twokeys.logger.info("Writing provision config...");
	await fs.writeFile(join(twokeys.properties.clientRoot, PROVISION_CONFIG_STORAGE), stringifyAnyConfig(provisionConfigFile));
}