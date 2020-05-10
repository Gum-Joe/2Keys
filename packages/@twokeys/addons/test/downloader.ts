/**
 * Downloader test
 */
import { join } from "path";
import { Software } from "../src/util/interfaces";
import Downloader from "../src/util/downloader";
import chai from "chai";

chai.use(require("chai-fs"));
chai.use(require("chai-as-promised"));
const { expect } = chai;

const SAVE_PATH = join(__dirname, "non-mocha", "ahk.zip");

describe("Downloader tests", () => {
	it("should download", async () => {
		const software: Software = {
			name: "ahk",
			url: "https://codeload.github.com/HotKeyIt/ahkdll-v2-release/zip/master",
			homepage: "https://autohotkey.org",
			executables: [
				{
					name: "AHK_DLL",
					path: "./x64w/AutoHotkey.dll",
					arch: "x64",
				}
			]
		};
		const downloader = new Downloader(software, SAVE_PATH);
		await downloader.download();
		expect(SAVE_PATH).to.be.a.file();
	});
})