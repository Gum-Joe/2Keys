/**
 * Software registry tests
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import { join, basename } from "path";
import chai, { expect } from "chai";
import rimraf from "rimraf";
import { open as openDB } from "sqlite";
import sqlite3 from "sqlite3";
import SoftwareRegistry from "../src/software";
import AddOnsRegistry from "../src/registry";
import {
	REGISTRY_FILE_NAME,
	SOFTWARE_TABLE_NAME,
	EXECUTABLES_TABLE_NAME,
	SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD,
	SOFTWARE_DOWNLOAD_TYPE_STANDALONE
} from "../src";
import { SOFTWARE_REG_ROOT, testPackage, testSoftware } from "./constants";
import mkdirp from "mkdirp";

chai.use(require("chai-fs"));
chai.use(require("chai-as-promised"));

let softwareRegisty: SoftwareRegistry<"executor">;

describe("Software Registry tests", () => {
	before(function (done) {
		this.timeout(50000);
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

	describe("Software installation", () => {
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

		it(`should successfully download a software and not extract (i.e. stand alone download) when type is ${SOFTWARE_DOWNLOAD_TYPE_STANDALONE}`, async () => {
			const testSoftware2 = Object.assign({}, testSoftware);
			testSoftware2.downloadType = SOFTWARE_DOWNLOAD_TYPE_STANDALONE;
			testSoftware2.name = "ahk2";
			await softwareRegisty.installSoftware(testSoftware2);
			// Installed?
			expect(join(softwareRegisty.getOneSoftwareFolder(testSoftware2.name), basename(testSoftware2.url))).to.be.a.file();
		}).timeout(30000);
		it("should respect custom filenames", async () => {
			const testSoftware2 = Object.assign({}, testSoftware);
			testSoftware2.downloadType = SOFTWARE_DOWNLOAD_TYPE_STANDALONE;
			testSoftware2.name = "ahk3";
			testSoftware2.filename = "ahk-filename-test.zip";
			await softwareRegisty.installSoftware(testSoftware2);
			// Installed?
			expect(join(softwareRegisty.getOneSoftwareFolder(testSoftware2.name), "ahk-filename-test.zip")).to.be.a.file();
		}).timeout(30000);
	});

	describe("Software registry creation", () => {
		// Mostly error checking
		it("should throw an error creating a software DB if a registry DB doesn't already exist.", async () => {
			await expect(SoftwareRegistry.createSoftwareRegistry(join(__dirname, "non-mocha"))).to.be.rejectedWith(/Registry DB likely does not exist!(.*)/);
		});
		it("should throw an error creating a software DB if one has already been made", async () => {
			await expect(SoftwareRegistry.createSoftwareRegistry(SOFTWARE_REG_ROOT)).to.be.rejectedWith(/Software table already existed!(.*)/);
		});
		it("should throw an error creating a software DB if the executables table exists, but not the software", async () => {
			const FAKE_ROOT = join(SOFTWARE_REG_ROOT, "error_test");
			await mkdirp(FAKE_ROOT);
			await AddOnsRegistry.createNewRegistry(FAKE_ROOT);
			await SoftwareRegistry.createSoftwareRegistry(FAKE_ROOT);
			const db = await openDB({
				filename: join(FAKE_ROOT, REGISTRY_FILE_NAME),
				driver: sqlite3.Database,
			});
			await db.exec(`DROP TABLE ${SOFTWARE_TABLE_NAME};`);
			await db.close();
			await expect(SoftwareRegistry.createSoftwareRegistry(FAKE_ROOT)).to.be.rejectedWith(/Executables table already existed!(.*)/);
		}).timeout(20000);
	});
});