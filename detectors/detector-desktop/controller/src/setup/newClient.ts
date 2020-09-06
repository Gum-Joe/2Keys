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

import type { PromisedTaskFunction } from "@twokeys/addons/src";
import { ClientConfig } from "@twokeys/core/lib/interfaces";
import { ClientConfigHere } from "../config";

/**
 * Function to setup a new client
 */
const newClient: PromisedTaskFunction<ClientConfig<ClientConfigHere>> = async (twokeys, config) => {
	twokeys.logger.status("Setting up a new VM");
	// TODO: Action List
	// 0: Check vagrant and VBox is installed
	// 1: Create base files (from templates)
	// 2: Adjust Ansible config
	// 3: Run `vagrant up` & handle errors
	// 4: SSH in and validate 2Keys is installed; copy client config & configure shares (run 2Keys client init)
};

export default newClient;