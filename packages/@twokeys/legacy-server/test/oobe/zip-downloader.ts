// Tests the zip downloader
import { join } from "path";
import chai, { expect } from "chai";
import mkdirp from "mkdirp";
import rimraf from "rimraf";
import ZipDownloader from "../../src/oobe/software/zip-downloader";
import { MOCK_ROOT } from "../global/constants";

chai.use(require("chai-as-promised"));
chai.use(require("chai-fs"));

const ZIP_FILENAME = "ahk_v2.zip";
const ROOT = join(MOCK_ROOT, "oobe_test");
const FILE_PATH = join(ROOT, ZIP_FILENAME);

// We don't use the zip downloader here due to race conditions and random failure
// Thus, this is disabled
describe.skip("Zip downloader test (can take a while to run)", () => {

	before(async () => {
		await mkdirp(ROOT);
	});

	it("should successfully download a zip file and extract it", async () => {
		const zipDownloader = new ZipDownloader("AHK v2", "https://codeload.github.com/HotKeyIt/ahkdll-v2-release/zip/master", ROOT, ZIP_FILENAME);
		// Validate it doesn't extract a non-existant zip
		await expect(zipDownloader.extract()).to.be.rejectedWith(Error);
		await zipDownloader.fetch_file(); // Fetch
		// Validate it doesn't attept to redownload
		await expect(zipDownloader.fetch_file()).to.be.rejectedWith(Error);
		// Validate download
		expect(FILE_PATH).to.be.a.file();
		// Extract & test
		await zipDownloader.extract();
		expect(join(ROOT, "ahkdll-v2-release-master")).to.be.a.directory().and.include.files(["README.md", "LICENSE", "HASH"]);
		expect(join(ROOT, "ahkdll-v2-release-master", "x64w")).to.be.a.directory().and.include.files(["AutoHotkey.exe", "AutoHotkey.dll"]);
	}).timeout(120000);

	after((done) => {
		rimraf(ROOT, done);
	});
});
