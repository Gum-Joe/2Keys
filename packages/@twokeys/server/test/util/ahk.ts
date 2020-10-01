import { fetch_hotkey, run_hotkey } from "../../src/util/ahk";
import { MOCK_KEYBAORD_NAME, MOCK_ROOT } from "../global/constants";
import { Config } from "../../src/util/interfaces";
import { config_loader } from "../../src/util/config";

import chai, { expect } from "chai";
import { join } from "path";
import { promises as fs } from "fs";

chai.use(require("chai-as-promised"));

let config: Config | any;

/** @deprecated no longer needed */
describe.skip("AHK execution tests", () => {

	before(async () => {
		config = await config_loader();
	});

	it("should successfully fetch a hotkey with file, function and type, given a keyboard and hotkey that is an object in config.", async () => {
		const hotkey = await fetch_hotkey(MOCK_KEYBAORD_NAME, "+A$HOME$");
		expect(hotkey).to.deep.equal({
			type: config.keyboards[MOCK_KEYBAORD_NAME].hotkeys["+A$HOME$"].type,
			file: join(MOCK_ROOT, MOCK_KEYBAORD_NAME, config.keyboards[MOCK_KEYBAORD_NAME].root),
			func: config.keyboards[MOCK_KEYBAORD_NAME].hotkeys["+A$HOME$"].func,
		});
	});

	it("should successfully fetch a hotkey with file, function and type, given a keyboard and hotkey that is a string.", async () => {
		const hotkey = await fetch_hotkey(MOCK_KEYBAORD_NAME, "+B$HOME$");
		expect(hotkey).to.deep.equal({
			type: "down",
			file: join(MOCK_ROOT, MOCK_KEYBAORD_NAME, config.keyboards[MOCK_KEYBAORD_NAME].root),
			func: config.keyboards[MOCK_KEYBAORD_NAME].hotkeys["+B$HOME$"],
		});
	});

	it("should successfully execute a hotkey", async () => {
		await run_hotkey(
			join(MOCK_ROOT, MOCK_KEYBAORD_NAME, config.keyboards[MOCK_KEYBAORD_NAME].root),
			config.keyboards[MOCK_KEYBAORD_NAME].hotkeys["^RT"],
		);

		expect(
			(await fs.readFile(join(MOCK_ROOT, "./RunTestForExecution1.txt"))).toString(),
		).to.equal("IT WORKED!");
	});

	it("should throw a ReferenceError when attmepting to call a non-existant hotkey", async () => {
		await expect(fetch_hotkey(MOCK_KEYBAORD_NAME + "NOTAKEYBOARD", "+B$HOME$")).to.be.rejectedWith(ReferenceError);
	});

	it("should throw a ReferenceError when attmepting to call from a non-existant keyboard", async () => {
		await expect(fetch_hotkey(MOCK_KEYBAORD_NAME, "INVALID")).to.be.rejectedWith(ReferenceError);
	});

	after(async () => {
		// Delete file
		await fs.unlink(join(MOCK_ROOT, "./RunTestForExecution1.txt"));
	});
});
