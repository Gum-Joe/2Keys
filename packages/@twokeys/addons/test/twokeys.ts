/**
 * Tests for twokeys
 */
import chai from "chai";
import { join } from "path";
import { TwoKeys } from "../src/module-interfaces";
import { testPackage, REGISTRY_DIR } from "./constants";
import { REGISTRY_FILE_NAME } from "../src/util/constants";
import { Logger } from "@twokeys/core";
import { LoggerArgs } from "@twokeys/core/src/interfaces";
chai.use(require("chai-fs"));
chai.use(require("chai-as-promised"));

const { expect } = chai;

class NewLogger extends Logger {
	constructor(args: LoggerArgs) {
		super(args);
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore: Needed for testing
		this.args.isTest = true;
	}
}

describe("TwoKeys Object tests", () => {
	it("should use our custom logger", () => {
		const twokeys = new TwoKeys(testPackage, join(REGISTRY_DIR, REGISTRY_FILE_NAME), NewLogger, {});
		expect(twokeys.logger.args).to.haveOwnProperty("isTest");
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore: Needed for testing
		expect(twokeys.logger.args.isTest).to.be.true;
	});

	it("should use a regular logger", () => {
		const twokeys = new TwoKeys(testPackage, join(REGISTRY_DIR, REGISTRY_FILE_NAME), undefined, {});
		expect(twokeys.logger.args).to.not.haveOwnProperty("isTest");
	});
});