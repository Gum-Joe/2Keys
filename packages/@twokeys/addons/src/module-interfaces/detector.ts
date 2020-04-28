/**
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
 * @license
 */
/**
 * Contains the interfaces that define the exports of a detector controller
 * @packageDocumentation
 */

import { Keyboard } from "@twokeys/core/src/interfaces";
import { ConfigDescriptors, StepsExplainer, TaskFunction } from "./common";

/**
 * Defines the config provided to {@link DetectorController.setup.addDetectorToProject.registerKeyboard}
 * Will probably eventually be a class, adding methods to e.g. modify the detector 
 */
export interface DetectorRegisterKDBConfig {
	/** Actual keyboard being registered */
	keyboard: Keyboard;
	/** Name of keyboard being registered */
	keyboardName: string;
}

/**
 * Defines the exports of a detector controller add-on.
 * 
 * About detectors and detector controllers:
 * - A __client__ is a physical device that you plug keyboard into, that run the detector software.
 * - A __detector__ is the code that runs on a client that detects keyboard presses.
 * 	on the keyboards plugged into the client (and by extension hotkeys), forwarding this info to the server
 * 	so that it can execute the appropiate macro.
 * 	- A detector (that is a client, with the detector software on) is project agnostic, and are added to project so they can be used.
 * - A __detector controller__ handles detector to server interaction **outside** of hotkeys.
 * 	These are functions such as keeping configs in sync, management functions (such as applying updates) and setup.
 */
export interface DetectorController {
	/** Export of the code to do with setup of a detector, specifically sertting up a new client and addin g to project */
	setup: {
		/** Required properties to help with setting up a new client */
		setupNewClient: { // Setup a new client
			/**
			 * Descriptors of config properties, used to render/prompt for config
			 */
			configDescriptor: ConfigDescriptors;
			/** Steps to explain to user that will occur to setup a new client as a detector */
			steps: StepsExplainer;
			/** Function to run, with the config created using {@link DetectorController.setup.setupNewClient.configDescriptor} */
			setup: TaskFunction<any>;
		};
		/** Export of the code to do with adding a detector */
		addDetectorToProject: {
			configDescriptor: ConfigDescriptors;
			/** Function to run to add the detector to the project */
			setup: TaskFunction<any>;
			/** Function to run to register a new keyboard.  This will usually be actions such as matching the keybaord in config to a physical device */
			registerKeyboard: TaskFunction<DetectorRegisterKDBConfig>;
		};
	};
	/** Options to add to the properties panel so that detector specific things can be configured */
	assignToKeyOptions: ConfigDescriptors;
	/**
	 * Function to log keypresses to screen for a given keyboard.
	 * The use of this function is mainly diagnostic and is for the user's benefit:
	 * the idea is that you log all keypreses (or just a live log from the detector) to screen
	 * so the user can see e.g. scancodes of keys that don't have a 2Keys hotkey code.
	 */
	logKeys: TaskFunction<any>;
	/**
	 * Context menu functions, that is used to display actions that can be undergone on a detector.
	 * Is diplayed in the project window in the GUI
	 */
	contextMenu: Array<{ name: string; func: TaskFunction<any> }>;
	/**
	 * Used to retrieve logs from the detector.
	 * This is different to {@link DetectorController.logKeys}, as instead of being live
	 * it is more a retrival operation that would most likely return the content of the detector's log file.
	 * @returns Detector logs
	 */
	getLogs: TaskFunction<any, {
		/** The log itself */
		log: string;
		/** Time of log */
		time: Date;
	}>;
}
