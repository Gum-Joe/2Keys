import { expect } from "chai";
import { CONFIG_DEFAULT_FILE_SERVER } from "../lib/constants.js";


describe("Misc tests", () => {
	it("should create the app data folder when process.env.APPDATA is not present", () => {
		const atFirst = CONFIG_DEFAULT_FILE_SERVER;
		process.env.APPDATA = undefined;
		const newConstants = require("../lib/constants.js");
		expect(newConstants.CONFIG_DEFAULT_FILE_SERVER).to.equal(atFirst);
	});
});
