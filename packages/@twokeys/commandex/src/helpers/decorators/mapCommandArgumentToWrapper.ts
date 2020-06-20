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
 * Contains code for the decorator that maps arguments for the wrapper function to those in the actual function
 * @packageDocumentation
 */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import type { BaseCommandInterface, BaseCommandStaticProperties } from "../commands";
import { MappingTypes } from "../../util/interfaces";

const isVarName = require("../../util/isValidVarName");

/**
 * Maps an argument in the command constructor to an argument of the command wrapper
 * @param commandArgumentIndex Index of the argument in the command that is being mapped to `desiredWrapperArgumentIndex`
 * @param desiredWrapperArgumentIndex Index of the argument in the wrapper function
 * @param wrapperArgumentName Name of argumnent in the wrappper function
 */
export default function mapCommandArgumentToWrapper
(commandArgumentIndex: number, desiredWrapperArgumentIndex: number, wrapperArgumentName: string){
	// Validation
	if (!isVarName(wrapperArgumentName)) {
		throw new Error("Error! Invalid command name - it must be a valid JS varibale name!");
	}
	// Return decorator
	// The BaseCommandStaticProperties here to allow abstract classes to be used
	return function (constructor: BaseCommandInterface | BaseCommandStaticProperties): void {
		// Add it to the map
		constructor.commandArgumentsMap.set(commandArgumentIndex, {
			type: MappingTypes.MappedArgument,
			wrapperArgumentName,
			desiredWrapperArgumentIndex,
		});
	};
}