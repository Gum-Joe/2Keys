/**
 * Contains the defintions of what a task function is
 * @packageDocumentation
 */

import { TwoKeys } from "./twokeys";

/**
 * Defines a generic task function used to run tasks, like command and add-on functions, such as:
 * - Setup of a detector
 * - Execution of a hotkey
 * @param twokeys An object provided to the task function that allow it to interact with 2Keys and access function for, for example, logging
 * @param config Config object to pass to function
 * @template TypeOfTwokeys A class that extends {@link TwoKeys} that the TaskFunction uses
 * @template GenericConfigT Generic where the config the add-on wants is defined
 * @template ReturnG An optional return type for the Promise
 */
export type BaseTaskFunction<TypeOfTwokeys extends TwoKeys, GenericConfigT, ReturnG = void> = (twokeys: TypeOfTwokeys, config: GenericConfigT) => ReturnG;

