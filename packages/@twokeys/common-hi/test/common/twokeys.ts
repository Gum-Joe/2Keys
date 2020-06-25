import BaseTwoKeysForCommands from "@twokeys/common-hi/src/common/twokeys";
import { Logger } from "@twokeys/core";
import { expect } from "chai";

describe("TwoKeys object tests", () => {
	it("should create a BaseTwoKeys class with the right logger name", () => {
		const twokeys = new BaseTwoKeysForCommands(Logger, {
			commandName: "test",
		});
		expect(twokeys.logger.args.name).to.equal("command:test");
	});
});