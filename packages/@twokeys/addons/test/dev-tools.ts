/**
 * Tests for devtools
 * @packageDocumentation
 */
import { createMockTwoKeys, assertIsForProject } from "../src/dev-tools";
import { REGISTRY_DIR } from "./constants";
import { REGISTRY_FILE_NAME } from "../src/util/constants";
import { join } from "path";
import { expect, AssertionError } from "chai";
import { TwoKeys } from "../src/module-interfaces";
import { TwoKeys as TwoKeysFromCore } from "@twokeys/core";

describe("Dev Tools tests", () => {
	it("createMockTwoKeys(): should throw AsserrtionError when the twokeys key has invalid types", () => {
		expect(() => createMockTwoKeys({
			twokeys: {
				types: ["executor", "invalid"],
				entry: {
					executor: "app.js"
				}
			}
		}, join(REGISTRY_DIR, REGISTRY_FILE_NAME))).to.throw(/type invalid/);
	});
	it("createMockTwoKeys(): should create a TwoKeys object, inherited from the one in core", () => {
		expect(createMockTwoKeys({
			twokeys: {
				types: ["executor"],
				entry: {
					executor: "app.js"
				}
			}
		}, join(REGISTRY_DIR, REGISTRY_FILE_NAME)))
			.to.be.instanceOf(TwoKeys)
			.and.to.be.instanceOf(TwoKeysFromCore);
	});

	it("assertIsForProject(): should throw an error when properties.projectDir key is not present on TwoKeys", () => {
		const mockTwoKeys = createMockTwoKeys({
			twokeys: {
				types: ["executor"],
				entry: {
					executor: "app.js"
				}
			}
		}, join(REGISTRY_DIR, REGISTRY_FILE_NAME));
		expect(() => assertIsForProject(mockTwoKeys)).to.throw(/projectDir not present/);
	});
});
