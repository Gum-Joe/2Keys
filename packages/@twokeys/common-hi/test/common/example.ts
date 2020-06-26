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
 * Contains a complete example of how commands works (at least stateless ones)
 */
import BaseTwoKeysForCommands, { ensureIsValidTwoKeysClass } from "../../src/common/twokeys";
import { Logger } from "@twokeys/core";
import CommandFactory from "../../src/common/command-factory";
import { CommandInfo, Command, BaseStatefulCommand } from "../../src/common/base-commands";

// First create a TwoKeys class to use:
@ensureIsValidTwoKeysClass // It's reccomended you add this line, it ensures you have the right constructor
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
class TwoKeys extends BaseTwoKeysForCommands {
	constructor(commandInfo: CommandInfo) {
		// Simple TwoKeys class, just used to set a default logger
		super(Logger, commandInfo);
	}
}

// Then create a CommandFactory:
const commandFactory = new CommandFactory(TwoKeys);

// Now here's a command:
// Define a config
interface ConfigType {
	name: string;
}
// Define the command itself
const someCommand: Command<ConfigType> = (twokeys: TwoKeys, config: ConfigType) => {
	twokeys.logger.info("IT worked!");
	twokeys.logger.info(config.name);
};

// Next, wrap it to create a command
const wrappedCommand = CommandFactory.wrapCommand(someCommand, "someCommand");

// And now we call it
commandFactory.callCommand(wrappedCommand, { name: "someName" });	

// STATEFUL COMMANDS
// Define the command itself
// And also wrap
@CommandFactory.wrapStatefulCommand("someStatefulCommand")
class SomeStatefulCommand extends BaseStatefulCommand {
	public run(config: ConfigType): void {
		this.twokeys.logger.info("IT worked!");
		this.twokeys.logger.info(config.name);
	}
}

// Now use it
const TheCommand = commandFactory.createStatefulCommand(SomeStatefulCommand);

TheCommand.run({
	name: "hi"
});