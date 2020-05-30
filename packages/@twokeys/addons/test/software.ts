/**
 * Software registry tests
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import { join, basename, relative, normalize } from "path";
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
	SOFTWARE_DOWNLOAD_TYPE_STANDALONE,
	SQLBool,
	Software,
	SOFTWARE_ROOT_FOLDER,
	ExecutableInDB,
	SoftwareInDB
} from "../src";
import { SOFTWARE_REG_ROOT, testPackage, testSoftware, testSoftwareUninstalled, testSoftwareToUpdate } from "./constants";
import mkdirp from "mkdirp";
import SoftwareRegistryQueryProvider from "../src/software-query-provider";

chai.use(require("chai-fs"));
chai.use(require("chai-as-promised"));

let softwareRegistry: SoftwareRegistry<"executor">;

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
		softwareRegistry = new SoftwareRegistry({
			directory: SOFTWARE_REG_ROOT,
			package: testPackage
		});
		// Implicitly tested as part of functions
		// await softwareRegisty.initDB();
	});

	describe("Software Registry Critical Methods", () => {
		it("should get the software root for this add-on", () => {
			expect(softwareRegistry.getSoftwareFolderRoot()).to.equal(join(SOFTWARE_REG_ROOT, SOFTWARE_ROOT_FOLDER, testPackage.name));
		});
		it("should get the software folder for one piece of software", () => {
			expect(softwareRegistry.getOneSoftwareFolder(testSoftware.name)).to.equal(join(SOFTWARE_REG_ROOT, SOFTWARE_ROOT_FOLDER, testPackage.name, testSoftware.name));
		});
	});

	describe("Software Registry Creation", () => {
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

	describe("Software Installation", () => {
		it("should successfully insert a software (noAutoInstall = true)", async () => {
			await softwareRegistry.installSoftware({
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
			await softwareRegistry.installSoftware(testSoftware);
			// Installed?
			expect(join(softwareRegistry.getOneSoftwareFolder(testSoftware.name), "ahkdll-v2-release-master")).to.be.a.directory();
			expect(join(softwareRegistry.getOneSoftwareFolder(testSoftware.name), testSoftware.executables[0].path)).to.be.a.file();
		}).timeout(30000);

		it(`should successfully download a software and not extract (i.e. stand alone download) when type is ${SOFTWARE_DOWNLOAD_TYPE_STANDALONE}`, async () => {
			const testSoftware2 = Object.assign({}, testSoftware);
			testSoftware2.downloadType = SOFTWARE_DOWNLOAD_TYPE_STANDALONE;
			testSoftware2.name = "ahk2";
			await softwareRegistry.installSoftware(testSoftware2);
			// Installed?
			expect(join(softwareRegistry.getOneSoftwareFolder(testSoftware2.name), basename(testSoftware2.url))).to.be.a.file();
		}).timeout(50000);

		it("should fail to install a piece of software already installed", async () => {
			await expect(softwareRegistry.installSoftware(testSoftware)).to.be.rejectedWith(/(.*)name already used(.*)/);
		});

		it("should respect custom filenames", async () => {
			const testSoftware2 = Object.assign({}, testSoftware);
			testSoftware2.downloadType = SOFTWARE_DOWNLOAD_TYPE_STANDALONE;
			testSoftware2.name = "ahk3";
			testSoftware2.filename = "ahk-filename-test.zip";
			await softwareRegistry.installSoftware(testSoftware2);
			// Installed?
			expect(join(softwareRegistry.getOneSoftwareFolder(testSoftware2.name), "ahk-filename-test.zip")).to.be.a.file();
		}).timeout(30000);

		it("should respect userInstalled for executables, by using the path provided purely", async () => {
			// HACK: Hack used as JS doesn't support deep cloning
			const testSoftware2: Software = JSON.parse(JSON.stringify(testSoftware));
			testSoftware2.name = testSoftware2.name + Math.random().toString();
			testSoftware2.executables[0].name = testSoftware2.executables[0].name + "2";
			testSoftware2.executables[0].userInstalled = true;
			testSoftware2.executables[0].path = "python3";
			await softwareRegistry.installSoftware(testSoftware2);
			const docs = await softwareRegistry.db.all<ExecutableInDB[]>(`SELECT * FROM ${EXECUTABLES_TABLE_NAME} WHERE name = "${testSoftware2.executables[0].name}"`);
			expect(docs).to.be.of.length(1);
			expect(docs[0].path).to.equal(testSoftware2.executables[0].path);
			expect(docs[0].userInstalled).to.equal(SQLBool.True);
		});

		it("should throw an error if executables have the same names in the same piece of software, and then delete the software", async () => {
			// HACK: Hack used as JS doesn't support deep cloning
			const testSoftware4: Software = JSON.parse(JSON.stringify(testSoftware));
			testSoftware4.executables.push(testSoftware4.executables[0]);
			// Change name
			testSoftware4.name = testSoftware4.name + Math.random() + Math.random();
			// DEW IT, and check
			await expect(softwareRegistry.installSoftware(testSoftware4)).to.be.rejectedWith(/(.*)executable(.*)already used/);
			await expect(softwareRegistry.db.all(`SELECT * FROM ${SOFTWARE_TABLE_NAME} WHERE name = ?`, testSoftware4.name)).to.eventually.deep.equal([]);
		});
	});

	describe("Software Updating", () => {
		before(async () => {
			await softwareRegistry.installSoftware(testSoftwareToUpdate);
		});

		it("should successfully rename an executable", async () => {
			const newExecName = testSoftwareToUpdate.executables[1].name + Math.random();
			await softwareRegistry.renameExecutable(testSoftwareToUpdate.name, testSoftwareToUpdate.executables[1].name, newExecName);
			await expect(softwareRegistry.db.all(`SELECT * FROM ${EXECUTABLES_TABLE_NAME} WHERE name = ?`, newExecName)).to.eventually.be.of.length(1);
		});

		it("should successfully delete an executable", async () => {
			await softwareRegistry.deleteExecutable(testSoftwareToUpdate.name, testSoftwareToUpdate.executables[2].name);
			await expect(softwareRegistry.db.all(`SELECT * FROM ${EXECUTABLES_TABLE_NAME} WHERE name = ?`, testSoftwareToUpdate.executables[2].name))
				.to.eventually.be.of.length(0);
		});

		it("should successfully update a piece of software", async () => {
			
		});
	});
	

	describe("Software Uninstall", () => {
		before(async () => {
			// Add software
			await softwareRegistry.installSoftware(testSoftwareUninstalled);
			expect(softwareRegistry.getOneSoftwareFolder(testSoftwareUninstalled.name)).to.be.a.directory();
			await expect(softwareRegistry.getSoftware(testSoftwareUninstalled.name)).to.eventually.be.fulfilled;
		});

		it("should successfully uninstall a piece of software", async () => {
			const dir = softwareRegistry.getOneSoftwareFolder(testSoftwareUninstalled.name);
			const softwareOriginal = await softwareRegistry.getSoftware(testSoftwareUninstalled.name);
			expect(softwareOriginal).to.not.be.null;
			await softwareRegistry.uninstallSoftware(testSoftwareUninstalled.name);
			expect(dir).to.not.be.a.path();
			// Check if still in DB
			await expect(softwareRegistry.db.all(`SELECT * FROM ${SOFTWARE_TABLE_NAME} WHERE name = ?;`, testSoftwareUninstalled.name)).to.eventually.deep.equal([]);
			await expect(softwareRegistry.db.all(`SELECT * FROM ${EXECUTABLES_TABLE_NAME} WHERE softwareId = ?;`, softwareOriginal.id)).to.eventually.deep.equal([]);
		});

		it("should not throw an error uninstalling non-existant software", async () => {
			await expect(softwareRegistry.uninstallSoftware("NOT_A_PIECE_OF_SOFTWARE")).to.eventually.be.fulfilled;
		});
	});

	describe("Software Registry Querying", () => {
		// Just in case
		before(async () => {
			try { 
				await softwareRegistry.installSoftware(testSoftware);
			} catch (err) {
				if (!err.message.includes("name already used")) {
					throw err;
				}
			}
		});

		it("should successfully retrieve a piece of software", async () => {
			// Assumes testSoftware has been instaleed
			const result = await softwareRegistry.getSoftware(testSoftware.name);
			// Data check
			// Check for non DB keys
			expect(result).to.haveOwnProperty("id");
			expect(result).to.haveOwnProperty("installed");
			expect(result.installed).to.be.true;
			expect(result.ownerName).to.equal(testPackage.name);
			expect(result.executables).to.be.of.length(1);
			expect(result.executables[0]).to.haveOwnProperty("id");
			expect(result.executables[0]).to.haveOwnProperty("os");
			expect(result.executables[0]).to.haveOwnProperty("softwareId");
			expect(relative(softwareRegistry.getOneSoftwareFolder(testSoftware.name), result.executables[0].path)).to.equal(normalize(testSoftware.executables[0].path));
			// Hack to change properties so that the deep include works (since the DB has the abolsute path)
			// Combine the executable DB props with the ones we provided
			const testSoftware2: Software = Object.assign({}, testSoftware);
			testSoftware2.executables[0].path = join(softwareRegistry.getOneSoftwareFolder(testSoftware.name), testSoftware2.executables[0].path);
			expect(result).to.deep.include({ ...testSoftware2, executables: result.executables.map((value, index) => { return { ...value, ...testSoftware2.executables[index] }; })});
		});

		it("should throw an error getting a piece of software not in the DB", async () => {
			await expect(softwareRegistry.getSoftware("NOT_IN_DB")).to.eventually.be.rejectedWith(/ENOENT(.*)/);
		});

		it("should return empty array getting a executable not in the DB", async () => {
			await expect(softwareRegistry.getExecutable("NOT_IN_DB", "NOT_IN_DB")).to.eventually.be.rejectedWith(/ENOENT(.*)/);
		});

		it("should return an array when we call getSoftwares() on SoftwareRegistry (warning also displayed, but this is not testable)", async () => {
			const results = await Promise.all([softwareRegistry.getSoftwares(testSoftware.name), softwareRegistry.getSoftware(testSoftware.name)]);
			expect(results[0]).to.deep.equal([results[1]]);
		});

		describe("Base class SoftwareRegistryQueryProvider tests", () => {
			let softwareQueryRegistry: SoftwareRegistryQueryProvider;
			before(async () => {
				softwareQueryRegistry = new SoftwareRegistryQueryProvider({
					directory: SOFTWARE_REG_ROOT,
				});
				// DB init is implicitly tested
			});

			describe("getSoftwares()", () => {
				it("should retrieve all softwares when no argument passed", async () => {
					const results = await softwareQueryRegistry.getSoftwares();
					const comparsion = await softwareQueryRegistry.db.all<SoftwareInDB[]>(`SELECT * FROM ${SOFTWARE_TABLE_NAME};`);
					// Length tells us if it has all been fetched
					expect(results.length).to.equal(comparsion.length);
					return;
				});
				it("should retrieve all software for a specific add-on when no software name is passed, both for the query class and the main software registry class (getAllSoftware()", async () => {
					const oldPackage = Object.assign({}, softwareRegistry.package);
					softwareRegistry.package.name = "test-addon-10";
					await softwareRegistry.installSoftware(testSoftware);
					// Test doubles added, now test
					const results = await softwareQueryRegistry.getSoftwares(null, "test-addon-10");
					const results2 = await softwareRegistry.getAllSoftware();
					// Checks
					expect(results).to.be.of.length(1);
					expect(results[0].ownerName).to.equal("test-addon-10");
					// Length tells us if it has all been fetched
					expect(results2).to.deep.equal(results);
					// Reassign
					softwareRegistry.package.name = oldPackage.name;
				});
				it("should get all software of a given name, when no ownerName is passed", async () => {
					const results = await softwareQueryRegistry.getSoftwares(testSoftware.name);
					expect(results).to.be.of.length(2);
					expect(results[0].ownerName).to.not.equal(results[1].ownerName);
				});
				it("should not mix up software with the same name from mulltiple add-ons", async () => {
					const results = await softwareQueryRegistry.getSoftwares(testSoftware.name, testPackage.name);
					expect(results).to.be.of.length(1);
					expect(results[0].ownerName).to.equal(testPackage.name);
				});
			});

			describe("getExecutable()", () => {
				it("should successfully get an executable", async () => {
					// TODO
					const result = await softwareRegistry.getExecutable(testSoftware.name, testSoftware.executables[0].name);
					// Self query
					const softwareRes = await softwareRegistry.db.get<SoftwareInDB>(`SELECT * FROM ${SOFTWARE_TABLE_NAME} WHERE name = ? AND ownerName = ?;`, [testSoftware.name, softwareRegistry.package.name]);
					if (typeof softwareRes === "undefined") {
						throw new Error("Got back no software when looking for our test software!");
					}
					const executable = await softwareRegistry.db.get<ExecutableInDB>(
						`SELECT * FROM ${EXECUTABLES_TABLE_NAME} WHERE name = ? AND softwareId = ?;`,
						[testSoftware.executables[0].name, softwareRes.id]
					);
					// Check
					await expect(result).to.deep.equal(executable);
				});
				it("should successfully get all executables when no name is passed", async () => {
					// TODO
					const result = await softwareRegistry.getExecutables(testSoftware.name);
					// Self query
					const softwareRes = await softwareRegistry.db.get<SoftwareInDB>(`SELECT * FROM ${SOFTWARE_TABLE_NAME} WHERE name = ? AND ownerName = ?;`, [testSoftware.name, softwareRegistry.package.name]);
					if (typeof softwareRes === "undefined") {
						throw new Error("Got back no software when looking for our test software!");
					}
					const executables = await softwareRegistry.db.all<ExecutableInDB[]>(
						`SELECT * FROM ${EXECUTABLES_TABLE_NAME} WHERE name = ? AND softwareId = ?;`,
						[testSoftware.executables[0].name, softwareRes.id]
					);
					// Check
					await expect(result).to.deep.equal(executables);
				});
			});
		});
	});
	
});