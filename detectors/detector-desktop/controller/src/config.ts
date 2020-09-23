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
 * Types for config
 * @packageDocumentation
 */

/**
 * Keyboard identifyers
 */
export interface KeyboardIdentifyer {
	/** VBox identifyer for this passthrough */
	filterName: string;
	vendorID: string;
	productID: string;
	/** Optional serial number (not present on some devices) */
	serialNumber?: string;
	uuid: string;
	/** Path to USB device */
	address: string;
}

/**
 * Defines a project we want to refer to because it use a client
 */
export interface ProjectReference {
	path: string;
	/** RELATIVE Path to script to use that will be in `/vagrant` (usually `projects/project-name-uuid.yml`) */
	ansibleProvisioner: string;
}

/**
 * Config for this controller, stored under the client configs inside a {@link ClientConfig}
 */
export interface ClientConfigHere {
	perms: {
		/** Add client to startup? */
		addToStartup: boolean;
		/** Automatically apply updates to client? **RESERVED FOR FUTURE USE** */
		// TODO: Implement allowAutoUpdate (detector-desktop)
		allowAutoUpdate: boolean;
	};

	/** Keyboard to capture (passthrough).  Added as we go along. */
	keyboards: KeyboardIdentifyer[];

	projects: ProjectReference[];

	/** Executables, optional for the config from generateConfig.  Only set this if the user has specifically set a vagrant path */
	executables: Partial<{
		vagrant: string;
	}>;
}