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
 * Interfaces to define the different types of add-on, i.e. what they must export.
 * Add-on types are defined in {@link TWOKEYS_ADDON_TYPES}.
 * @packageDocumentation
 */

import { Keyboard, Hotkeys, HotkeyTypeSingle, DetectorConfig } from "@twokeys/core/src/interfaces";

/**
 * Placeholder for twokeys modules object.
 */
export type TwoKeysModule = any;

/**
 * Interface for setup descriptors.
 * These are what define the questions the 2Keys runner (that is the GUI or CLI) should ask a user
 * when running setup for an appropriate action
 * 
 * Example:
 * ```json
 * {
 * 	"name": "IP Address",
 * 	"inputType": "LINE_TEXT",
 *  "type": "string";
 * }
 * ```
 */
export interface ConfigDescriptor {
	// TODO: Implement
	[key: string]: string;
}

/** A list of config descriptors ({@link ConfigDescriptor}) */
export type ConfigDescriptors = ConfigDescriptor[];

/**
 * Describes a series of steps that will be displayed to the users as to what a detector controller will do
 * to setup a detector.
 * The index in the array represents the step number.
 */
export interface StepsExplainer {
	/** Header to display */
	header: string;
	/** Body text */
	explainer: string;
}

/**
 * Defines a generic task function used to execute addon tasks, such as:
 * - Setup of a detector
 * - Execution of a hotkey
 * @template GenericConfigT Generic where the config the add-on wants is defined
 * @template ReturnG An optional return type for the Promise
 */
export type TaskFunction<GenericConfigT, ReturnG = void> = (twokeys: TwoKeysModule, config: GenericConfigT) => Promise<ReturnG>;

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
 * Config for {@link Executor.exec}
 * @template ExecutorHotKeyConfig Defintion of the config an executor expects in a hotkey
 */
export interface ExecutorExecConfig<ExecutorHotKeyConfig extends HotkeyTypeSingle> {
	/** Hotkey from the config to execute */
	hotkey: HotkeyTypeSingle & ExecutorHotKeyConfig;
	/** Hotkey code (used as the key in {@link Hotkeys}) */
	hotkeyCode: string;
	/** Executor config from config ({@link Keyboard.executors}) */
	executorConfig: Keyboard["executors"]["executorName"];
}

/** Config for {@link Executor.addToKeyboard} */
export interface AddExecutorToKeyboardConfig {
	/** Path to keyboard root dir */
	path: string;
	/** Keyboard config */
	keyboardConfig: Keyboard;
	/** Name of keyboard (used as the key in {@link DetectorConfig.keyboards}) */
	keyboardName: string;
}

// TODO: Add types for TaskFunction<T, G>
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
	contextMenu: Array<{ name: string, func: TaskFunction<any> }>;
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

/** Properties for a scanned hotkey from {@link Executor.scan} */
export interface ExecutorScanIndividual {
	/** Name of macro function, set as {@link HotkeyTypeSingle.func} */
	name: string;
	/** A nice display name for UIs */
	displayName?: string;
	description?: string;
}

/**
 * Defines what {@link Executor.scan} should return as one element in its array,
 * where there are multiple files available.
 * This represents one file in what would be an array of these.
 */
export interface ExecutorScanMultiFileOne {
	/** Path to file with macro functions in */
	file: string;
	/** Macro functions in the file */
	funcs: ExecutorScanIndividual[];
}
/**
 * Defines what {@link Executor.scan} should return,
 * {@link ExecutorScanMultiFileOne} should be used where there are multiple files,
 * else, return an array of strings where each string is a macro function
 */
export type ExecutorScan = ExecutorScanMultiFileOne[] | ExecutorScanIndividual[];

/** Defines the exports for an executor */
export interface Executor {
	/** Options to present to user when installing executor software */
	installOptions: ConfigDescriptors;
	/** Function that runs when installing the executor, doing, for example, downloading the executor software */
	install: TaskFunction<any>;
	/** Executes a hotkey */
	execute: TaskFunction<ExecutorExecConfig<HotkeyTypeSingle>>;
	/** Options to present to user when defining a new hotkey (e.g. the function to execute) */
	hotkeyOptions: ConfigDescriptor;
	/**
	 * Assign an executor to a hotkey (a {@link HotkeyTypeSingle}), adding in the nesecary config params to it (such as the function to execute)
	 * Is optional
	 * @returns Hotkey config
	 */
	assignToKey?: TaskFunction<ExecutorExecConfig<HotkeyTypeSingle>, ExecutorExecConfig<HotkeyTypeSingle>["hotkey"]>;
	/**
	 * Scan for function to execute for {@link HotkeyTypeSingle.func}
	 * @returns A list of functions
	 */
	scan: TaskFunction<any, ExecutorScan>; // Scan for functions
	/** Adds an executor to a kdb, creating e.g. boilerplate files */
	addToKeyboard: TaskFunction<AddExecutorToKeyboardConfig>; // Add executor to a KDB (e.g. create boilerplate files)
}
