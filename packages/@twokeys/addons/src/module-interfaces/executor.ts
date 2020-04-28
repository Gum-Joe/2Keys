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
 * Contains the interfaces that define the exports of an executor
 * @packageDocumentation
 */

import { HotkeyTypeSingle, Keyboard } from "@twokeys/core/src/interfaces";
import { ConfigDescriptors, TaskFunction, ConfigDescriptor } from "@twokeys/addons/lib/module-interfaces";

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
	scan: TaskFunction<Keyboard, ExecutorScan>; // Scan for functions
	/** Adds an executor to a kdb, creating e.g. boilerplate files */
	addToKeyboard: TaskFunction<AddExecutorToKeyboardConfig>; // Add executor to a KDB (e.g. create boilerplate files)
}
