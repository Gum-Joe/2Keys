// Test for file copying
import { join } from "path";
import chai from "chai";
import rimraf from "rimraf";
import copy_contents from "../../src/util/copy-contents";
import { MOCK_ROOT } from "../global/constants";
import chaiFS from "chai-fs";

chai.use(chaiFS);

const { expect } = chai;

// Consts
const MOCK_ROOT_COPY = join(MOCK_ROOT, "../non-mocha-copy");

describe.skip("Copy contents of folder function test", () => {

	it("should successfully copy contents of a dir to another", async () => {
		await copy_contents(MOCK_ROOT, MOCK_ROOT_COPY);
		expect(MOCK_ROOT_COPY).to.be.a.directory().and.include.files(["config.yml"]);
		expect(join(MOCK_ROOT_COPY, "keyboard_test")).to.be.a.directory().and.include.files(["index.ahk", "test.ahk"]);
	});

	after((done) => {
		// Delete coped files
		rimraf(MOCK_ROOT_COPY, done);
	});

});
