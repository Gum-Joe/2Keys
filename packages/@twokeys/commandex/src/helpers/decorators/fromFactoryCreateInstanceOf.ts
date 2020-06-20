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
 * Below: this decorator automatically maps a constrcutor, stored in the command factory,
 * to an argument for the constrcutor of a stateful command,
 * that is of a given type
 * @packageDocumentation
 */

import { MappingTypes } from "../../util/interfaces";
import type { Constructor, InstanceGenerator } from "../../util/types";
import type { BaseCommandInterface, BaseCommandStaticProperties } from "../commands";

/**
 * This decorator is used to map types (specifically those with constructors, so classes) that would be in the final CommandFactory
 * to command arguments inside the command factory wrappers. It adds the types to a map (see {@link BaseCommand.commandTypeMap}),
 * which is then used to create instances of given types
 * that are provided as arguments (at argument index `argumentIndex`) to the command.
 * 
 * Stateful commands only.
 * @param argumentIndex Index of argument in the constructor where instance of `argumentType` will go
 * @param argumentType Constuctor for the type to create
 * @param instanceGenerator Create an instance of `argumentType` for the command
 * @template T the type to create/use.  The constructor type for this is auto-inferred/computed.
 */
export default function fromFactoryCreateInstanceOf<T>(argumentIndex: number, argumentType: Constructor<T>, instanceGenerator: InstanceGenerator<T>) {
	// The BaseCommandStaticProperties here to allow abstract classes to be used
	return function (constructor: BaseCommandInterface | BaseCommandStaticProperties): void {
		// Add it to the map
		constructor.commandArgumentsMap.set(argumentIndex, {
			type: MappingTypes.FromFactoryInstanceOf,
			argumentType,
			instanceGenerator,
			forArgumentIndex: argumentIndex,
		});
	};
}
