import { TwoKeys, Logger } from "../src";
import { expect } from "chai";

describe("TwoKeys tests", () => {
	it("should use our custom logger", () => {
		class TestedTwoKeys extends TwoKeys {}
		class TestLogger extends Logger {
			public testProp = true;
		}
		const twokeys = new TestedTwoKeys(TestLogger, "theLogger", {});
		expect(twokeys.logger).to.be.instanceOf(TestLogger);
	});
});
