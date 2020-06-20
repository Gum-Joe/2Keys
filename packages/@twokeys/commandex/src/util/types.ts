/**
 * Defines types we might need
 */

import type { CommandInfo } from "./interfaces";

/** 
 * Gets the constructor of T
 * @template T Type to get constructor for
 */
export type Constructor<T> = { new (...args: any[]): T }; // From https://www.simonholywell.com/post/typescript-constructor-type.html
export type AbstractConstructor<T> = Function & { prototype: T } // From https://stackoverflow.com/questions/36886082/abstract-constructor-type-in-typescript

/**
 * Generates an instance of T for a specific command
 * @template T Type to generate an instance of
 * @param commandInfo Information about the commmand the instance is being generated for
 * @param TypeToGenerate Constrcutor function of the type to generate
 * @returns An instance of T.
 */
export type InstanceGenerator<T> = (commandInfo: CommandInfo, TypeToGenerate: Constructor<T>) => T;

/**
 * A single type in the map that has been mapped
 * @template T Type being mapped
 */
export type OneMappedType<T> = {
	instanceGenerator: InstanceGenerator<T>;
	/** Index of argument in the function that this instance of type is for */
	forArgumentIndex: number;
}
/**
 * Type map
 * Stores the mapping of class types to function arguments.
 * This is so we can use our own 2Keys class in commands and create instances of it.
 */
export class CommandTypeMap extends Map<Constructor<any>, OneMappedType<any>> {}