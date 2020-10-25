/**
 * Tests for twokeys
 */
import chai from "chai";
import { basename, join } from "path";
import { TwoKeys } from "../src/module-interfaces";
import { testPackage, REGISTRY_DIR } from "./constants";
import { REGISTRY_FILE_NAME } from "../src/util/constants";
import { Logger } from "@twokeys/core";
import { LoggerArgs } from "@twokeys/core/src/interfaces";
import native from "@twokeys/native-utils";
import sinon from "sinon";
import os from "os";

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

	describe("TwoKeys Utils test (twokeys-utils.ts)", () => {
		try {
			native.get_startup_folder();
		} catch (err) {
			// Mock
			sinon.replace(native, "get_startup_folder", () => join(__dirname, "non-mocha"));
		}

		const twokeys = new TwoKeys(testPackage, join(REGISTRY_DIR, REGISTRY_FILE_NAME), undefined, {});
		const targetFilename = `2Keys-add-on-${testPackage.name}-${basename(__filename)}`;
		
		it("should get symbollink path correctly", () => {
			expect(twokeys.utils.getSymbolLinkPath(__filename)).to.include(targetFilename);
		});

		it("should successfully symbollink", async () => {
			await twokeys.utils.symbolLinkToStartup(__filename);
			expect(join(native.get_startup_folder(), targetFilename)).to.exist;
		});

		it("should successfully delete a symbolink", async () => {
			await twokeys.utils.deleteSymbolLinkTo(__filename);
			expect(join(native.get_startup_folder(), targetFilename)).to.not.be.a.path;
		});

		it("should fail if platform is not win32", () => {
			sinon.replace(os, "platform", () => "darwin");
			expect(() => twokeys.utils.getSymbolLinkPath(__filename)).to.throw("OS platform");
		});

		after(() => {
			sinon.restore();
		});
	});
});

