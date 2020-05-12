/**
 * Software registry tests
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import { join } from "path";
import chai, { expect } from "chai";
import rimraf from "rimraf";
import { open as openDB } from "sqlite";
import sqlite3 from "sqlite3";
import SoftwareRegistry from "../src/software";
import AddOnsRegistry from "../src/registry";
import {
	Package,
	REGISTRY_FILE_NAME,
	REGISTRY_TABLE_NAME,
	SOFTWARE_TABLE_NAME,
	EXECUTABLES_TABLE_NAME,
	Software,
	SOFTWARE_DOWNLOAD_TYPE_ZIP,
	SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD
} from "../src";

chai.use(require("chai-fs"));
chai.use(require("chai-as-promised"));

const SOFTWARE_REG_ROOT = join(__dirname, "non-mocha", "registry", "softwareTest");
let softwareRegisty: SoftwareRegistry<"executor">;
const testPackage: Package<"executor"> = {
	name: "test1",
	types: ["executor"],
	info: {
		version: "1.0.0",
		description: "A TEST",
		size: null,
	},
	entry: {
		executor: "./test.js",
	},
}

const testSoftware: Software = {
	name: "ahk",
	url: "https://codeload.github.com/HotKeyIt/ahkdll-v2-release/zip/master",
	homepage: "https://autohotkey.org",
	downloadType: SOFTWARE_DOWNLOAD_TYPE_ZIP,
	executables: [
		{
			name: "AHK_DLL",
			path: "ahkdll-v2-release-master/x64w/AutoHotkey.dll",
			arch: "x64",
		}
	]
};

describe("Software Registry test", () => {
	before((done) => {
		rimraf(SOFTWARE_REG_ROOT, (err) => {
			if (err) { return done(err); }
			done();
		});
	});

	before(async () => {
		await AddOnsRegistry.createNewRegistry(SOFTWARE_REG_ROOT);
		await SoftwareRegistry.createSoftwareRegistry(SOFTWARE_REG_ROOT);
		softwareRegisty = new SoftwareRegistry({
			directory: SOFTWARE_REG_ROOT,
			package: testPackage
		});
		await softwareRegisty.initDB();
	});

	it("should successfully insert a software", async () => {
		await softwareRegisty.installSoftware({
			name: "test-software",
			url: "https://google.com",
			homepage: "https://google.com",
			downloadType: SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD,
			executables: [
				{
					name: "test-exe",
					path: "test.exe",
					arch: "x64",
				}
			],
			noAutoInstall: true,
		});
		const db = await openDB({
			filename: join(SOFTWARE_REG_ROOT, REGISTRY_FILE_NAME),
			driver: sqlite3.Database,
		});
		const docs = await db.all(`SELECT * FROM ${SOFTWARE_TABLE_NAME} WHERE name = "test-software"`);
		expect(docs).to.be.of.length(1);
		expect(docs[0].installed).to.equal(0);
		expect(docs[0].ownerName).to.equal("test1");
		expect(docs[0]).to.haveOwnProperty("id");
		const executables = await db.all(`SELECT * FROM ${EXECUTABLES_TABLE_NAME} WHERE softwareId = "${docs[0].id}"`);
		expect(executables).to.be.of.length(1);
		expect(executables[0].name).to.equal("test-exe");
		expect(executables[0].os).to.equal(process.platform);
	});

	it("should successfully install a software (download and extract)", async () => {
		await softwareRegisty.installSoftware(testSoftware);
		// Installed?
		expect(join(softwareRegisty.getOneSoftwareFolder(testSoftware.name), "ahkdll-v2-release-master")).to.be.a.directory();
		expect(join(softwareRegisty.getOneSoftwareFolder(testSoftware.name), testSoftware.executables[0].path)).to.be.a.file();
	}).timeout(30000);
});