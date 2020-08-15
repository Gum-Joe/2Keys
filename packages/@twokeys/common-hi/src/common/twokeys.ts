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
 * Defines types for the TwoKeys class that commands should use.
 * 
 * Example of a final TwoKeys class:
 * ```typescript
 * import { Logger } from "@twokeys/core";
 * @ensureIsValidTwoKeysClass
 * class FinalTwoKeys extends BaseTwoKeysForCommands {
 * 	constructor(commandInfo: CommandInfo) {
 * 		super(Logger, commandInfo);
 * 	}
 * }
 * ```
 * @packageDocumentation
 */
import { TwoKeys, Logger, TwoKeysProperties } from "@twokeys/core";
import { CommandInfo } from "./base-commands";

/**
 * The TwoKeys child class to use for commands as a base class.
 * Please don't use this directly, create an extended version that has a constructor matching {@link FinalTwoKeysConstructor}.
 * This has to be extended to use the logger you want (either the GUI one or the CLI one).
 * @see TwoKeys
 */
export default class BaseTwoKeysForCommands extends TwoKeys {
	constructor(logger: typeof Logger, commandInfo: CommandInfo, properties: TwoKeysProperties) {
		super(logger, commandInfo.commandName, properties);
	}
}

/**
 * The final constructor that should be implemented by a child of {@link BaseTwoKeysForCommands}
 * 
 * Example of a final TwoKeys class:
 * @example
 * ```typescript
 * import { Logger } from "@twokeys/core";
 * @ensureIsValidTwoKeysClass
 * class FinalTwoKeys extends BaseTwoKeysForCommands {
 * 	constructor(commandInfo: CommandInfo) {
 * 		super(Logger, commandInfo);
 * 	}
 * }
 * ```
 */
export interface FinalTwoKeysConstructor<TwokeysClass extends BaseTwoKeysForCommands = BaseTwoKeysForCommands> {
	new(commandInfo: CommandInfo, properties: TwoKeysProperties): TwokeysClass;
}

/**
 * Decorator function to ensure a final TwoKeys class is valid,
 * and has the right constructor (i.e. matches {@link FinalTwoKeysConstructor})
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ensureIsValidTwoKeysClass(constructor: FinalTwoKeysConstructor): void {
	// The very existence of this function causes it to be valid thanks to TS typechecking
}