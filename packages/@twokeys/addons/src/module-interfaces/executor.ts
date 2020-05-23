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

import type { HotkeyTypeSingle, Keyboard } from "@twokeys/core/src/interfaces";
import type { ConfigDescriptors, TaskFunction, ConfigDescriptor, BaseAddon } from "./";
import type { TWOKEYS_ADDON_TYPE_EXECUTOR } from "../util/interfaces";

/**
 * Config for {@link Executor.exec}
 * @template ExecutorConfig Defintion of the config an executor expects in a hotkey & for `config.keyboard.executors[executor]`. WIll be provided as generic to {@link HotkeyTypeSingle} so don't provide this as part of the generic
 */
export interface ExecutorExecConfig<ExecutorConfig> {
	/**
	 * Hotkey from the config to execute.
	 * This is **combined** with `config.keyboard.executors[executor]`.
	 * Like so:
	 * ```ts
	 * executorConfig.hotkey = { ...keyboard.executors[executor], ...keyboard.hotkeys[hotkeyCode] }
	 * ```
	 */
	hotkey: HotkeyTypeSingle<ExecutorConfig>;
	/** Hotkey code (used as the key in {@link Hotkeys}) */
	hotkeyCode: string;
	/**
	 * Executor config from ({@link Keyboard.executors}).
	 * Included for reference purposes
	 * Please note this included in the `hotkey` key above (hotkey config and this are combined together into one object; see above)
	 **/
	executorDefaultConfig: ExecutorConfig;
	/** Keyboard hotkeys are from (config)*/
	keyboard: Keyboard;
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

export type ExecutorTaskFunction<ConfigT, ReturnG = void> = TaskFunction<ConfigT, ReturnG, TWOKEYS_ADDON_TYPE_EXECUTOR>

/**
 * Defines the exports for an executor
 * @template THotkeyConfig Definition of the configuration of a hotkey in config files
 */
export interface Executor<THotkeyConfig = { [key: string]: string }> extends BaseAddon<TWOKEYS_ADDON_TYPE_EXECUTOR> {
	/** Executes a hotkey */
	execute: ExecutorTaskFunction<ExecutorExecConfig<THotkeyConfig>>;
	/** Options to present to user when defining a new hotkey (e.g. the function to execute) */
	hotkeyOptions: ConfigDescriptor;
	/**
	 * Assign an executor to a hotkey (a {@link HotkeyTypeSingle}), adding in the nesecary config params to it (such as the function to execute)
	 * Is optional
	 * @returns Hotkey config
	 */
	assignToKey?: ExecutorTaskFunction<ExecutorExecConfig<HotkeyTypeSingle<THotkeyConfig>>, ExecutorExecConfig<HotkeyTypeSingle<THotkeyConfig>>["hotkey"]>;
	/**
	 * Scan for function to execute for {@link HotkeyTypeSingle.func}
	 * @returns A list of functions
	 */
	scan: ExecutorTaskFunction<Keyboard, ExecutorScan>; // Scan for functions
	/** Adds an executor to a kdb, creating e.g. boilerplate files */
	addToKeyboard: ExecutorTaskFunction<AddExecutorToKeyboardConfig>; // Add executor to a KDB (e.g. create boilerplate files)
}
