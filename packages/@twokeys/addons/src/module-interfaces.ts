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
 * Interfaces to define the different types of module, i.e. what they must export
 * @packageDocumentation
 */

/**
 * Interface for setup descriptors.
 * These are what define the questions the 2Keys runner (that is the GUI or CLI) should ask a user
 * when running setup for an appropriate action
 */
export interface ConfigDescriptor {
	
}

/**
 * Defines the exports of a detector controller add-on
 */
export interface DetectorController {
	/** Export of the code to do with setup of a detector, specifically sertting up a new client and addin g to project */
	setup: {
		/** Required properties to help with setting up a new client */
		setupNewClient: { // Setup a new client
			/**
			 * Descriptors of config properties, used to render/prompt for config
			 */
			configDescriptor: [
				// Items to add to the config page
				{
					name: "IP Address"; // WHat input is labeled as
					inputType: "LINE_TEXT";
					type: string; // Maybe not needed?
				}
			];
			steps: [ // Array of expaliners for steps screen
				{
					header: "SSH in";
					explainer: "DUMMY TEXT";
				}
			];
			install: (twokeys, config) => {}; // Function ran to setup the client at the end 

		};
		addDeviceToProject: {
			configDescriptor: [
				// Items to add to the config page
				{
					name: "Start Detector on Startup"; // WHat input is labeled as
					inputType: "CHECKBOX";
					type: boolean; // Maybe not needed?
				}
			];
			install: (twokeys, config) => {}; // Function ran to setup the detector at the end
			registerKeyboard: (twokeys, config) => {}; // Function to setup a new keybaord
		};
	};
	assignToKeyOptions: [
		{
			name: "Fire on:";
			inputType: "LINE_TEXT";
			type: string; // Up or down
		}
	];
	logKeys();
	contextMenu: [
		{
			name: "Open in SSH";
			func: () => {}; // Handler for on click

		}
	]; // Function used to get key logs so scan code can be retrieved
	getLogs();
}

interface Executor {
	execute: (twokeys, config) => {}; // Execution function
	installOptions: [ // Present options and config stuff to user
		{
			name: "AHK Install location"; // WHat input is labeled as
			inputType: "LINE_TEXT";
			type: string; // Maybe not needed?
		}
	];
	addToKeyboardOptions: [
		{
			name: "Root AHK file";
			inputType: "LINE_TEXT";
			type: string;
		}
	];
	assignToKeyOptions: [
		{
			name: "Function";
			inputType: "LINE_TEXT";
			type: string;
		}
	];
	assignToKey(twokeys, config);
	scan(); // Scan for functions
	addToKeyboard(); // Add executor to a KDB (e.g. create boilerplate files)
	install: (twokeys, config) => {}; // Install func for downloads so we can e.g. pass the location to install and register software to
}
