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
 * Holds the functions that handle hotkey executions
 * @packageDocumentation
 */
import { promises as fs, constants as fsconstants } from "fs";
import { join } from "path";
import type { TwoKeys, ExecutorExecConfig } from "@twokeys/addons";
import { AUTO_HOTKEY_H, AHK_DLL_X64 } from "./constants";

const ahk = require("../build/Release/executor-ahk.node");

/** Defines the config expected by this executor */
export interface AHKExecutorConfig {
	/** Root file */
	root: string;
	/** Overloads func to be string */
	func: string;
}

/** Config type for that provided by 2Keys */
export type ThisExecutorConfig = ExecutorExecConfig<AHKExecutorConfig>;

/**
 * Gets the prelude, that is the code to go at the start of execution.
 * This is used to provided, e.g. globals to the hotkey.
 *
 * The following are provided:
 * - `Global TWOKEYS_CWD`: Current working directory where hotkeys should be being run.
 * 	This is because the AHK `A_WorkingDir` is not set properly.  Defaults to root of keyboard files
 */
function getPrelude(config: ThisExecutorConfig): string {
	return `
	; 2KEYS EXECUTOR AHK PRELUDE
	; CWD
	Global TWOKEYS_CWD := ${config.keyboard.root}
	`;
}

/**
 * Validates a function to prevent code injection.
 * Function names must be only alphanumerical.
 * AHK root files must exist, and be in the root dir.
 * If it throws an error, you've had a problem.
 */
async function validateConfig(twokeys: TwoKeys<"executor">, config: ThisExecutorConfig): Promise<void> {
	// Check it exists
	try {
		await fs.access(join(config.keyboard.root, config.hotkey.root), fsconstants.F_OK | fsconstants.S_IFREG);
		// 2: Verify func ok
		// Check if matches FuncName() format
		const regexp = /^[a-z0-9]+$/i; // From https://stackoverflow.com/questions/388996/regex-for-javascript-to-allow-only-alphanumeric
		if (regexp.test(config.hotkey.func)) {
			throw new SyntaxError("Hotkey function was not alphanumeric! (must match regexp /^[a-z0-9]+$/i)");
		}
		// Valid!
		twokeys.logger.debug("Hotkey validated & OK.");
		return;
	} catch (err) {
		twokeys.logger.err("ERROR! Validation failed!");
		throw err;
	}
}

export default async (twokeys: TwoKeys<"executor">, config: ThisExecutorConfig): Promise<void> => {
	twokeys.logger.info("Starting execution...");
	twokeys.logger.debug(`Hotkey: ${config.hotkeyCode}`);
	twokeys.logger.debug(`Function: ${config.hotkey.func}`);
	twokeys.logger.debug(`Root: ${config.hotkey.root}`);

	// 0: Validate. Throw error.
	await validateConfig(twokeys, config);

	// 1: Grab execution path
	twokeys.logger.debug("Grabbing executables from the registry...");
	const ahkExecutable = await twokeys.software.getExecutable(AUTO_HOTKEY_H, AHK_DLL_X64);

	// 0: Create execution string 
	const execString = `
	; 2KEYS EXECUTOR AHK EXECUTION
	${getPrelude(config)}

	; GRAB FILE
	#Include ${join(config.keyboard.root, config.hotkey.root)}

	; EXECUTE
	${config.hotkey.func}()
	`;
	twokeys.logger.info("Exec string created & config validated. Executing...");
	twokeys.logger.debug(execString);
	ahk.run_ahk_text("PATH", ahkExecutable.path);
	// DONE!
	twokeys.logger.info("Execution done.");
};