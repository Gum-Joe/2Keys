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
 * Contains the base, abstract class that all commands extend
 * @packageDocumentation
 */

/**
 * The base command, that all other commands must extend.
 * It provides the constructor for all commands, which in turn provides the logger.
 * 
 * This class can be extended to create other base commands, for example, a base command which includes access to the software registry.
 * 
 * ### What is a command?
 * A command is essentially a piece of logic, that is shared by both the CLI and GUI, that does something.
 * It is not neccesarily related to CLI commands.
 * 
 * Examples include:
 * - Syncronising detector and server config
 * - The install code that is used to show a running task with progress and console output,
 * 	usually for e.g. installing add-ons or software
 * - Commands to handle config creation
 * 
 * ### Rules
 * Command should be:
 * - small & modular: there should not be too much logic dedicated to one command;
 * 	if there is lots of logic, consider splitting it into more than 1 command.
 * 	Command should also be invokable by other commands
 * - assumptionless: commands should make no assumption about the environment they are ran under,
 * 	including (but not limited to) e.g. CWDs, locations of important files, etc
 */
import { Logger } from "@twokeys/core";

export default abstract class BaseCommand {

	protected logger: Logger;

	constructor(commandName: string, logger: typeof Logger) {
		this.logger = new logger({
			name: "command:" + commandName
		});
	}

	/** The actual method that runs the command */
	public async abstract run(): Promise<any>;
}