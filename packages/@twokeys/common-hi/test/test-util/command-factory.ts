/**
 * {@link CommandFactory} for tests to use
 * @packageDocumentation
 */
import { CommandFactory, BaseTwoKeysForCommands, ensureIsValidTwoKeysClass, CommandInfo } from "../../src/common";
import { Logger, TwoKeysProperties } from "@twokeys/core";

@ensureIsValidTwoKeysClass
export class TwoKeys extends BaseTwoKeysForCommands {
	constructor(commandInfo: CommandInfo, properties: TwoKeysProperties) {
		super(Logger, commandInfo, properties);
	}
}

export default new CommandFactory(TwoKeys);
