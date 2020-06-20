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

import { BaseCommand } from "../commands";
const isVarName = require("../../util/isValidVarName");

/**
 * Registers a stateful command,
 * adding information to {@link BaseCommand.commandInfo} that the compiler uses to:
 * 1. Detect that the class should be used as a command
 * 2. Add the command to the final CommandFactory
 * @param commandName Name of command being registered, used to set the name of the command in the final command factory
 */
export default function registerStatefulCommand(commandName: string): (construtor: typeof BaseCommand) => void {
	if (!isVarName(commandName)) {
		throw new Error("Error! Invalid command name - it must be a valid JS varibale name!");
	}
	return function (construtor: typeof BaseCommand): void {
		construtor.commandInfo = {
			name: commandName
		};
	};
}