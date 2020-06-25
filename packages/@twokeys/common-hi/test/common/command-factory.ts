import CommandFactory from "@twokeys/common-hi/src/common/command-factory";
import { expect } from "chai";
import BaseTwoKeysForCommands, { ensureIsValidTwoKeysClass } from "@twokeys/common-hi/src/common/twokeys";
import { CommandInfo } from "@twokeys/common-hi/src/common/base-commands";
import { Logger } from "@twokeys/core";

@ensureIsValidTwoKeysClass
class TwoKeys extends BaseTwoKeysForCommands {
	constructor(commandInfo: CommandInfo) {
		super(Logger, commandInfo);
	}
}

describe("Command factory tests", () => {
	describe("Static methods", () => {
		it("should add commandInfo property to a function", () => {
			function theCommand() {
				// Empty
			}
			const wrapped = CommandFactory.wrapCommand(theCommand, "someCommand");
			expect(wrapped).to.haveOwnProperty("commandInfo");
			expect(wrapped.commandInfo?.commandName).to.equal("someCommand");
		});
	});

	describe("Stateless command execution", () => {
		const factory = new CommandFactory(TwoKeys);
		it("should throw an error on a non-command", () => {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			expect(() => factory.callCommand(() => { }, {})).to.throw(/Attempted to call a non-command/);
		});
		it("should throw an error when not all command info is defined", () => {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			const someCommand = (): void => {};
			Object.defineProperty(someCommand, "commandInfo", { value: {} });
			expect(() => factory.callCommand(someCommand, {})).to.throw(/Property commandName was either undefined/);
		});
		it("should succesfully execute a command, with the right props", (done) => {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			const someCommand = (twokeys: TwoKeys): void => {
				expect(twokeys).to.be.instanceOf(TwoKeys);
				expect(twokeys.logger.args.name).to.equal("command:commandName");
				done();
			};
			expect(() => factory.callCommand(CommandFactory.wrapCommand(someCommand, "commandName"), {})).to.throw(/Property commandName was either undefined/);
		});
	});
});
