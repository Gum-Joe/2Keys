/**
 * Tests the registry code
 */
import { join } from "path";
import chai from "chai";
import rimraf from "rimraf";
import AddOnsRegistry from "../src/registry";
import { REGISTRY_FILE_NAME } from "../src/constants";

chai.use(require("chai-fs"));

const { expect } = chai;

const REGISTRY_DIR = join(__dirname, "non-mocha", "registry");

describe("Registry tests", () => {
	it("should create a registry", async () => {
		await AddOnsRegistry.createNewRegistry(join(__dirname, "non-mocha", "registry"));
		expect(REGISTRY_DIR).to.be.a.directory();
		expect(REGISTRY_DIR).with.files(["package.json", REGISTRY_FILE_NAME]);
	});

	after((done) => {
		// Cleanup
		rimraf(REGISTRY_DIR, done);
	});
});
