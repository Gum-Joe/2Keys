/**
 * Contains a complete example of how commands works (at least stateless ones)
 */
import BaseTwoKeysForCommands, { ensureIsValidTwoKeysClass } from "../src/common/twokeys";
import { Logger } from "@twokeys/core";
import CommandFactory from "../src/common/command-factory";
import { CommandInfo, Command } from "../src/common/base-commands";

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
}

// Next, wrap it to create a command
const wrappedCommand = CommandFactory.wrapCommand(someCommand, "someCommand");

// And now we call it
commandFactory.callCommand(someCommand, { name: "someName" });	