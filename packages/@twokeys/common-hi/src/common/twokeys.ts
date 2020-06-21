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
 * Defines the twokeys class we want to use
 * @packageDocumentation
 */

import { TwoKeys, Logger } from "@twokeys/core";
import { CommandInfo } from "./base-commands";

/**
 * The TwoKeys child class to use for commands
 * This has to be extended to use the logger you want (either the GUI one or the CLI one)
 */
export default class BaseTwoKeysForCommands extends TwoKeys {
	constructor(logger: typeof Logger, commandInfo: CommandInfo) {
		super(logger, "command:" + commandInfo.commandName);
	}
}

/**
 * The final constructor that should be implemented by a child of {@link BaseTwoKeysForCommands}
 */
export interface FinalTwoKeysConstructor {
	new(commandInfo: CommandInfo): BaseTwoKeysForCommands;
}

/**
 * Decorator function to ensure a final TwoKeys class is valid,
 * and has the right constructor (i.e. matches {@link FinalTwoKeysConstructor})
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ensureIsValidTwoKeysClass(constructor: FinalTwoKeysConstructor): void {
	// The very existence of this function causes it to be valid thanks to TS typechecking
}