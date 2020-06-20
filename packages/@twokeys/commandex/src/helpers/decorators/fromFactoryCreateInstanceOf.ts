/**
 * Below: this decorator automatically maps a constrcutor, stored in the command factory,
 * to an argument for the constrcutor of a stateful command,
 * that is of a given type
 */

import { CommandInfo } from "../../util/interfaces";
import { Constructor } from "../../util/types";
import { BaseCommand } from "../commands";

//type Constructor<T> = new (...args: any[]) => T; // From https://www.simonholywell.com/post/typescript-constructor-type.html
export type InstanceGenerator<T> = (commandInfo: CommandInfo, TypeToGenerate: Constructor<T>) => T;

const map = new Map<Constructor<any>, any>();

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
	return function (constructor: typeof BaseCommand): void {
		// Add it to the map
		constructor.commandTypeMap.set(argumentType, {
			instanceGenerator,
			forArgumentIndex: argumentIndex,
		});
	};
}
