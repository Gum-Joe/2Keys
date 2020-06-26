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
 * Contains the base, abstract class that all commands extend, as well as the types for stateless commands.
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
 * - Small & modular: there should not be too much logic dedicated to one command;
 * 	if there is lots of logic, consider splitting it into more than 1 command.
 * - Command should be invokable by other commands.
 * - assumptionless: commands should make no assumption about the environment they are ran under,
 * 	including (but not limited to) e.g. CWDs, locations of important files, etc
 * 	- And extension of this is that commands should be atomic, that is, isolated from other operations.  However, for e.g. writing to a DB, this may not be possible
 * @packageDocumentation
 */
import { implementsStaticProperties } from "@twokeys/core";
import TwoKeysForCommands from "./twokeys";
import BaseTwoKeysForCommands from "./twokeys";

/**
 * Defines information about a command, used for e.g. the logger
 */
export interface CommandInfo {
	commandName: string;
}

/**
 * Defines a stateless command.
 * We use a `Partial` for {@link CommandInfo} as it has to be set by a wrapper function, and we can't guarentee it has been called
 * @template ConfigT the type used as the config param for the command
 * @template ReturnU Return type of command
 * @param twokeys TwoKeys object to use in the command, see {@link TwoKeysForCommands} and {@link TwoKeys}
 */
export type Command<ConfigT, ReturnU = void> = ((twokeys: TwoKeysForCommands, config: ConfigT) => ReturnU) & { commandInfo?: Partial<CommandInfo> };

/**
 * Static props for a stateful command
 */
export interface StatefulCommandStaticProps {
	commandInfo: CommandInfo;
}

/**
 * Defines what the constructor for a stateful command should look like
 * @template StatefulCommandType The class that the constructor will return
 */
export interface StatefulCommandConstructor<StatefulCommandType extends BaseStatefulCommand> extends StatefulCommandStaticProps {
	new(twokeys: BaseTwoKeysForCommands): StatefulCommandType;
}

/**
 * The base command, that all other stateful commands must extend.
 * It provides the constructor for all commands and provides the logger.
 * Stateful commands are ones with a state
 * 
 * This class can be extended to create other base commands, for example, a base command which includes access to the software registry.
 * 
 * @param twokeys The TwoKeys object that the command will use; use this for logging, etc.
 * 
 * @see base-commands.ts for information about commands and the rules for them
  */
@implementsStaticProperties<StatefulCommandStaticProps>()
export abstract class BaseStatefulCommand {
	/** Properties about the command.  Inserted by the register command decorator */
	public static commandInfo: CommandInfo;
	
	constructor(protected twokeys: BaseTwoKeysForCommands) {}

	/** The actual method that runs the command */
	public abstract run(config: unknown): unknown;
}
