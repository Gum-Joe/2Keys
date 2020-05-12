/**
 * Downloader test
 */
import { join } from "path";
import { Software, SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD } from "../src/util/interfaces";
import Downloader from "../src/util/downloader";
import chai from "chai";
import ZipDownloader from "../src/util/zip-downloader";
import rimraf from "rimraf";

chai.use(require("chai-fs"));
chai.use(require("chai-as-promised"));
const { expect } = chai;

const SAVE_PATH = join(__dirname, "non-mocha", "download", "ahk.zip");
const EXTRACT_PATH = join(__dirname, "non-mocha", "download", "ahk");

describe("Downloader tests", () => {

	it("should download a file successfully", async () => {
		const software: Software = {
			name: "ahk",
			url: "https://codeload.github.com/HotKeyIt/ahkdll-v2-release/zip/master",
			homepage: "https://autohotkey.org",
			downloadType: SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD,
			noAutoInstall: true,
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
	}).timeout(50000);

	it("should download and extract a file successfully (ZipDownloader)", async () => {
		const software: Software = {
			name: "ahk",
			url: "https://codeload.github.com/HotKeyIt/ahkdll-v2-release/zip/master",
			homepage: "https://autohotkey.org",
			downloadType: SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD,
			executables: [
				{
					name: "AHK_DLL",
					path: "ahkdll-v2-release-master/x64w/AutoHotkey.dll",
					arch: "x64",
				}
			],
			noAutoInstall: true,
		};
		const downloader = new ZipDownloader(software, SAVE_PATH, EXTRACT_PATH);
		await downloader.download();
		await downloader.extract();
		expect(SAVE_PATH).to.be.a.file();
		expect(EXTRACT_PATH).to.be.a.directory();
	}).timeout(50000);

	after((done) => {
		rimraf(join(__dirname, "non-mocha", "download"), done);
	});
});