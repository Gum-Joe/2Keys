/**
 * Defines required interfaces
 * @packageDocumentation
 */

import type { InstanceGenerator, Constructor } from "./types";

/**
 * Used by wrapper functions/decorators to define information about a command
 */
export interface CommandInfo {
	/** Name of command */
	name: string;
}

/**
 * Types of mapping for wrapper -> commands
 */
export enum MappingTypes {
	/** Maps a property in the final command factory to the argument of a function that is of a given type */
	FromFactoryInstanceOf,
	/** Maps an argument from wrapper function to command */
	MappedArgument,
}

/** Based mapped command object */
export interface MappedThing<MapingType extends MappingTypes = MappingTypes> {
	type: MapingType;
}

/**
 * A single type that has been mapped as a {@link MappingTypes.FromFactoryInstanceOf}
 * @template T Type being mapped
 */
export interface OneMappedType<T> extends MappedThing<MappingTypes.FromFactoryInstanceOf> {
	instanceGenerator: InstanceGenerator<T>;
	/** Index of argument in the function that this instance of type is for */
	forArgumentIndex: number;
	/** Type that is mapped */
	argumentType: Constructor<T>;
}

export interface MappedArgument extends MappedThing<MappingTypes.MappedArgument> {
	/** Name of argument in the wrapper function */
	wrapperArgumentName: string;
	/** Index of argument in the wrapper function that is mapped */
	desiredWrapperArgumentIndex: number;
}

/**
 * Arguments Map
 * Maps arguments for the command constructors (the key is the index of the argument in the commadn constructor)
 * to their behaviour
 * This is so we can use our own 2Keys class in commands and create instances of it.
 */
export class CommandArgumentsMap extends Map<number, OneMappedType<any> | MappedArgument> { }