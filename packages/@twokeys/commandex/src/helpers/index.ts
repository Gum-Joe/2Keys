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
 * Contains helpers for writing commands and command factories,
 * such as types
 * @packageDocumentation
 */
import type { CommandInfo } from "../util/interfaces";

/**
 * Base command class (for stateful commands, that is, commands with a state),
 * that allother command should extend.
 * It defines the information needed for a command.
 * 
 * It is recomended you extend this with your own abstract `BaseCommand` class that defines a construtor that your commands need.
 * 
 * ### What is a command?
 * A command is essentially a piece of logic, that is shared by both the CLI and GUI, that does something.
 * It is not neccesarily related to CLI commands.
 * 
 * #### Commands can be either stateful or stateless:
 * - Stateless commands are capable of storing information and having a state, for example, holding a file in memory whilst the command is in use,
 * 	rather than loading it every time the command is called.  A more practical example in 2Keys is the sync command can maintain an SSH session to detectors
 * 	if implemented as a stateful command.  Stateful commands should be defined as classes, that extend this class
 * - Stateless commands are commands that are ran as a one off, where all the info needed is (ideally) provided via function arguments.  These should be defined as functions.
 * 
 * #### Examples of commands in 2Keys include:
 * - Syncronising detector and server config
 * - The install code that is used to show a running task with progress and console output,
 * 	usually for e.g. installing add-ons or software
 * - Commands to handle config creation
 *
 * ### Rules (for stateful commands)
 * Command should be:
 * - small & modular: there should not be too much logic dedicated to one command;
 * 	if there is lots of logic, consider splitting it into more than 1 command.
 * - Command should be invokable by other commands.
 * - assumptionless: commands should make no assumption about the environment they are ran under,
 * 	including (but not limited to) e.g. CWDs, locations of important files, etc
 * 	- And extension of this is that commands should be atomic, that is, isolated from other operations.  However, for e.g. writing to a DB, this may not be possible
 */
export abstract class BaseCommand {
	/**
	 * Function that must be defined, and is what would contain the logic that the command does.
	 * This is the function called by a program to run the command.
	 * Of course, it can still call other function within the class
	 * 
	 * Two options for this:
	 * - either a promise returning command  (use this for FS operations, etc) - this is the async/await version and allows async/await to be used
	 * - or a promisless one where await and promises are not required by the logic of the command.
	 * 
	 * If you choose to use promises anywhere in your function, please use the async/await version of this function.
	 * 
	 * Please remeber to define a return type in your actual function.
	 */
	public abstract async run(): Promise<unknown>;
	public abstract run(): unknown;

	/**
	 * Here's where the decorator functions put information about the command.
	 * It will be there when it is added via a decorator,
	 * if the decorator is not used a runtime error will be thrown in the final code.
	 */
	public commandInfo!: CommandInfo
}