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
import CommandFactory from "@twokeys/common-hi/src/common/command-factory";
import { expect } from "chai";
import BaseTwoKeysForCommands, { ensureIsValidTwoKeysClass } from "@twokeys/common-hi/src/common/twokeys";
import { CommandInfo, BaseStatefulCommand } from "@twokeys/common-hi/src/common/base-commands";
import { Logger } from "@twokeys/core";
import { TwoKeysProperties } from "@twokeys/core/lib/twokeys";

@ensureIsValidTwoKeysClass
class TwoKeys extends BaseTwoKeysForCommands {
	constructor(commandInfo: CommandInfo, properties: TwoKeysProperties) {
		super(Logger, commandInfo, properties);
	}
}

describe("Command factory tests", () => {
	describe("Static methods", () => {
		it("should add commandInfo property to a function", () => {
			// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
			function theCommand() {
				// Empty
			}
			const wrapped = CommandFactory.wrapCommand(theCommand, "someCommand", {});
			expect(wrapped).to.haveOwnProperty("commandInfo");
			expect(wrapped.commandInfo?.commandName).to.equal("someCommand");
		});

		it("should add commandInfo property to a stateful command class (as a static property", () => {
			const commandName = "someStatefulCommandName";
			@CommandFactory.wrapStatefulCommand(commandName, {})
			class TheCommand extends BaseStatefulCommand {
				public async run(config: boolean): Promise<void> {
					console.log(config);
				}
			}
			expect(TheCommand).to.haveOwnProperty("commandInfo");
			expect(TheCommand.commandInfo?.commandName).to.equal(commandName);
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
			const someCommand = (twokeys: TwoKeys, config: any): void => {
				expect(twokeys).to.be.instanceOf(TwoKeys);
				expect(twokeys.logger.args.name).to.equal("commandName");
				expect(config).to.haveOwnProperty("isHere");
				expect(config.isHere).to.be.true;
				done();
			};
			factory.callCommand(CommandFactory.wrapCommand(someCommand, "commandName", {}), { isHere: true });
		});
	});

	describe("Stateful command execution", () => {
		const factory = new CommandFactory(TwoKeys);
		it("should throw an error on a non-command", () => {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			expect(() => factory.createStatefulCommand(class NotACommand {})).to.throw(/Attempted to call a non-command/);
		});
		it("should throw an error when not all command info is defined", () => {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			class SomeCommand extends BaseStatefulCommand {
				// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
				public run() {
					// Empty
				}
			}
			Object.defineProperty(SomeCommand, "commandInfo", { value: {} });
			expect(() => factory.createStatefulCommand(SomeCommand)).to.throw(/Property commandName was either undefined/);
		});
		it("should succesfully execute a command, with the right props", (done) => {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			@CommandFactory.wrapStatefulCommand("someStatefulCommand", {})
			class SomeProperCommand extends BaseStatefulCommand {
				public run(): void {
					expect(this.twokeys).to.be.instanceOf(TwoKeys);
					expect(this.twokeys.logger.args.name).to.equal("someStatefulCommand");
					done();
				}
			}
			const theCommand = factory.createStatefulCommand(SomeProperCommand);
			expect(theCommand).to.be.instanceOf(SomeProperCommand);
			theCommand.run();
		});
	});
});
