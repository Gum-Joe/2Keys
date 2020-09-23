/* eslint-disable @typescript-eslint/ban-ts-ignore */
/**
 * @license
 * Copyright 2020 Kishan Sambhi
 *
 * This file is part of 2Keys.
 *
 * 2Keys is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 2Keys is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * Tests the registry code
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import { join } from "path";
import { promises as fs, constants as fsConstants } from "fs";
import chai from "chai";
import rimraf from "rimraf";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import AddOnsRegistry from "../src/registry";
import { REGISTRY_FILE_NAME, REGISTRY_TABLE_NAME } from "../src/util/constants";
import { PackageInDB, Package, TWOKEYS_ADDON_TYPES } from "../src/util/interfaces";
import { TWOKEYS_ADDON_TYPE_EXECUTOR } from "../src/util/interfaces";
import { REGISTRY_DIR, EXECUTOR_TEST } from "./constants";
import { Logger } from "@twokeys/core";
import { TwoKeys } from "../src/module-interfaces";
import { LoggerArgs } from "@twokeys/core/src/interfaces";
import * as errorCodes from "../src/util/error-codes";

chai.use(require("chai-fs"));
chai.use(require("chai-as-promised"));

const { expect } = chai;

let registry: AddOnsRegistry;

describe("Registry tests", () => {

	before((done) => {
		// Delete it
		rimraf(REGISTRY_DIR, () => {
			done(); // Do not handle error, since we just want to delete it if not there
		});
	});

	describe("Static methods", () => {

		it("should create a registry", async () => {
			await AddOnsRegistry.createNewRegistry(REGISTRY_DIR);
			expect(REGISTRY_DIR).to.be.a.directory();
			expect(REGISTRY_DIR).to.include.files(["package.json", REGISTRY_FILE_NAME]);
		}).timeout(20000);
		it("should gracefully fail to create a new registry in the same location", async () => {
			// tslint:disable-next-line: no-unused-expression
			const res = await AddOnsRegistry.createNewRegistry(REGISTRY_DIR);
			// tslint:disable-next-line: no-unused-expression
			expect(res.status).to.be.false;
			expect(res.message).to.include("already exists");
		}).timeout(20000);
		it("should error if we try to make a registry in an invalid location", async () => {
			// @ts-ignore: So we can make an invalid location
			// tslint:disable:no-unused-expression
			await expect(AddOnsRegistry.createNewRegistry({ notAPath: true })).to.be.rejected; 
		}).timeout(20000);
		it("should create a registry, with a db at a different folder when the option is given", async () => {
			const TEST_REG_DIR = join(REGISTRY_DIR, "test2");
			await AddOnsRegistry.createNewRegistry(TEST_REG_DIR, {
				dbFilePath: join(TEST_REG_DIR, "test.db"),
			});
			expect(TEST_REG_DIR).to.be.a.directory();
			expect(TEST_REG_DIR).to.include.files(["package.json", "test.db"]);
			const reg = new AddOnsRegistry(TEST_REG_DIR, { dbFilePath: join(TEST_REG_DIR, "test.db") });
			expect(() => reg.initDB()).to.not.throw();
		}).timeout(20000);

	});

	describe("Class methods", () => {
		before(async () => {
			await AddOnsRegistry.createNewRegistry(REGISTRY_DIR);
			registry = new AddOnsRegistry(REGISTRY_DIR);
			await registry.initDB();
		});

		describe("Initialisation", () => {
			it("should use our custom logger and TwoKeys objects", () => {
				class TestLogger extends Logger {
					constructor(args: LoggerArgs) {
						super(args);
						// @ts-expect-error
						this.args.testProp = true;
					}
				}
				class TwoKeysCustom<AddonType extends TWOKEYS_ADDON_TYPES> extends TwoKeys<AddonType> {
					public static isCustom = true;
				}
				const testReg = new AddOnsRegistry(REGISTRY_DIR, {
					Logger: TestLogger,
					TwoKeys: TwoKeysCustom,
				});
				// @ts-ignore
				expect(testReg.logger.args).to.haveOwnProperty("testProp");
				// @ts-ignore
				expect(testReg.logger.args.testProp).to.be.true;
				// @ts-ignore
				expect(testReg.TwoKeys).to.haveOwnProperty("isCustom");
				// @ts-ignore
				expect(testReg.TwoKeys.isCustom).to.be.true;
			});
		});
		

		describe("Package install", () => {
			it("should sucessfully install a package and NOT add it to the registry when twokeys properties are not present", async () => {
				await registry.install("mkdirp");
				expect(join(REGISTRY_DIR, "node_modules")).to.be.a.directory();
				expect(join(REGISTRY_DIR, "node_modules", "mkdirp")).to.be.a.directory();
				// Check DB
				const db = await open({
					filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME),
					driver: sqlite3.Database,
				});
				const docs = await db.all(`SELECT * FROM ${REGISTRY_TABLE_NAME} WHERE name = "mkdirp"`);
				await db.close();
				expect(docs).to.be.of.length(0);
			}).timeout(50000);

			it("should sucessfully install an executor add-on and add it to the registry", async () => {
				const pkgJSON = require(join(EXECUTOR_TEST, "package.json"));
				const status = await registry.install(EXECUTOR_TEST, { local: true });
				// tslint:disable-next-line: no-unused-expression
				expect(status.status).to.be.true;
				expect(join(REGISTRY_DIR, "node_modules")).to.be.a.directory();
				expect(join(REGISTRY_DIR, "node_modules", pkgJSON.name)).to.be.a.directory();
				// Check DB
				const db = await open({
					filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME),
					driver: sqlite3.Database,
				});
				const docs: PackageInDB[] = await db.all(`SELECT * FROM ${REGISTRY_TABLE_NAME} WHERE name = ?`, pkgJSON.name);
				await db.close();
				expect(docs).to.be.of.length(1);
				expect(docs[0].name).to.equal(pkgJSON.name);
				expect(JSON.parse(docs[0].types)).to.deep.equal([TWOKEYS_ADDON_TYPE_EXECUTOR]);
				expect(JSON.parse(docs[0].info).version).to.be.equal(pkgJSON.version);
				expect(JSON.parse(docs[0].entry).executor).to.be.equal(pkgJSON.twokeys.entry.executor);
			}).timeout(50000);

			it("should fail to add a package to the DB that is not installed", async () => {
				// tslint:disable-next-line: no-unused-expression
				await expect(registry.addPackageToDB("express")).to.be.rejected;
			});

			it("should not duplicate a package in the registry", async () => {
				const pkgJSON = require(join(EXECUTOR_TEST, "package.json"));
				const status = await registry.addPackageToDB(pkgJSON.name);
				// tslint:disable-next-line: no-unused-expression
				expect(status.status).to.be.false;
				// Check DB
				const db = await open({
					filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME),
					driver: sqlite3.Database,
				});
				const docs: PackageInDB[] = await db.all(`SELECT * FROM ${REGISTRY_TABLE_NAME} WHERE name = ?`, pkgJSON.name);
				await db.close();
				expect(docs).to.be.of.length(1);
			}).timeout(50000);

			it("should duplicate a package in the registry when force: true is passed and delete the old one", async () => {
				const pkgJSON = require(join(EXECUTOR_TEST, "package.json"));
				const status = await registry.addPackageToDB(pkgJSON.name, {
					force: true,
				});
				// tslint:disable-next-line: no-unused-expression
				expect(status.status).to.be.true;
				// Check DB
				const db = await open({
					filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME),
					driver: sqlite3.Database,
				});
				const docs: PackageInDB[] = await db.all(`SELECT * FROM ${REGISTRY_TABLE_NAME} WHERE name = ?`, pkgJSON.name);
				await db.close();
				expect(docs).to.be.of.length(1);
			}).timeout(50000);

			it("should reject a package with no valid type", async () => {
				const status = await registry.install(join(__dirname, "non-mocha/noType"), { local: true });
				// tslint:disable-next-line: no-unused-expression
				expect(status.status).to.be.false;
				expect(status.message).to.include("No valid type");
			}).timeout(50000);

			it("should reject a package with no types at all", async () => {
				const status = await registry.install(join(__dirname, "non-mocha/noType2"), { local: true });
				// tslint:disable-next-line: no-unused-expression
				expect(status.status).to.be.false;
				expect(status.message).to.include("No valid type");
			}).timeout(50000);

			it("should include optional properties in the registry and ignore invalid types in the entries list", async () => {
				// NOTE: Invalid entry points are still included in the registry as they can just be ignored
				// However, the `types` property should be filtered
				const status = await registry.install(join(__dirname, "non-mocha/optionalProps"), { local: true });
				const pkgJSON = require(join(__dirname, "non-mocha/optionalProps", "package.json"));
				// tslint:disable-next-line: no-unused-expression
				expect(status.status).to.be.true;
				// Check DB
				const db = await open({
					filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME),
					driver: sqlite3.Database,
				});
				const docs: PackageInDB[] = await db.all(`SELECT * FROM ${REGISTRY_TABLE_NAME} WHERE name = ?`, pkgJSON.name);
				expect(docs).to.be.of.length(1);
				const info: Package["info"] = JSON.parse(docs[0].info);
				const types: Package["types"] = JSON.parse(docs[0].types);
				expect(types).to.not.include("notAType");
				expect(types).to.be.of.length(1);
				expect(types).to.include("detector");
				expect(info).to.have.property("iconURL");
				expect(info).to.have.property("displayName");
				expect(info.iconURL).to.be.equal(pkgJSON.twokeys.iconURL);
				expect(info.displayName).to.be.equal(pkgJSON.twokeys.displayName);
			}).timeout(50000);

			// Add error handlers:
			it("should throw an error if npm has an error installing.", async () => {
				// tslint:disable-next-line: no-unused-expression
				await expect(registry.install("DEFINTILY_NOT_A_PACKAGE" + Math.random())).to.be.rejected;
			}).timeout(50000);
			it("should throw an error if encountered when adding a package.", async () => {
				// Pass an invalid path
				// @ts-ignore
				// tslint:disable-next-line: no-unused-expression
				await expect(registry.addPackageToDB({ notAFilePath: true })).to.be.rejected;
			}).timeout(50000);

			it("should run the package's install() function", async () => {
				await registry.install(join(__dirname, "non-mocha", "installTest"), { local: true });
				expect(join(REGISTRY_DIR, "test.txt")).to.be.a.file();
			});
		});

		describe("Package uninstall", () => {
			it("should succesfuly uninstall a package", async () => {
				const pkgJSON = require(join(EXECUTOR_TEST, "package.json"));
				await registry.uninstall(pkgJSON.name);
				await expect(fs.access(join(REGISTRY_DIR, "node_modules", pkgJSON.name), fsConstants.F_OK)).to.be.rejected;
				// Check DB
				const db = await open({
					filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME),
					driver: sqlite3.Database,
				});
				const docs: PackageInDB[] = await db.all(`SELECT * FROM ${REGISTRY_TABLE_NAME} WHERE name = ?`, pkgJSON.name);
				await db.close();
				expect(docs).to.be.of.length(0);
			}).timeout(50000);
			it("should throw an error uninstalling a package that does not exist", async () => {
				await expect(registry.uninstall("NOT_INSTALL")).to.be.eventually.rejected;
			}).timeout(50000);
		});

		describe("Package update", () => {
			it("should succesfuly update a package", async () => {
				// TODO: Update package from npm that is with 2Keys, we can't test this as no such package exists
				await registry.install("debug", {
					version: "3.0.0",
				});
				await registry.update("debug", "4.0.1");
				expect(join(REGISTRY_DIR, "node_modules", "debug")).to.be.a.directory();
				const pkgJSON = require(join(REGISTRY_DIR, "node_modules", "debug", "package.json"));
				expect(pkgJSON.version).to.be.equal("4.0.1");
			}).timeout(50000);

			it("should default to latest when updating a package", async () => {
				// TODO: Update package from npm that is with 2Keys, we can't test this as no such package exists
				await registry.install("debug", {
					version: "2.0.0",
				});
				await registry.update("debug");
				expect(join(REGISTRY_DIR, "node_modules", "debug")).to.be.a.directory();
				const pkgJSON = require(join(REGISTRY_DIR, "node_modules", "debug", "package.json"));
				expect(pkgJSON.version).to.not.be.equal("2.0.0");
			}).timeout(50000);
		});

		describe("Package reindexing", () => {
			it("should reindex the package", async () => {
				// Contaminate DB
				const db1 = await open({
					filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME),
					driver: sqlite3.Database,
				});
				await db1.run(
					`INSERT INTO ${REGISTRY_TABLE_NAME} (id, name, types, info, entry) VALUES ("UUID_0191914029374", "NOT_A_NAMED", "NOT_VALID", "WHAT??", "42")`,
				);
				await db1.close();
				// Reindex
				await registry.reindex();
				// Check
				const db2 = await open({
					filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME),
					driver: sqlite3.Database,
				});
				const docs = await db2.all(
					`SELECT * FROM ${REGISTRY_TABLE_NAME} WHERE id = "UUID_0191914029374"`,
				);
				await db2.close();
				expect(docs).to.be.of.length(0);
			});
		});

		describe("Add-On Loading", () => {
			const LOAD_TEST = join(__dirname, "non-mocha", "loadTest");
			const pkgJson = require(join(__dirname, "non-mocha", "loadTest", "package.json"));
			before(async function () {
				this.timeout(50000);
				await AddOnsRegistry.createNewRegistry(REGISTRY_DIR);
				registry = new AddOnsRegistry(REGISTRY_DIR);
				await registry.initDB();
				// Install packages
				await registry.install(LOAD_TEST, { local: true });
			});

			it("should load a add-on and allow us to execute it", async () => {
				const executor = await registry.load(pkgJson.name, "executor", {});
				const config = {
					testValue: false,
					hasProperties: false,
					expect,
				};
				// @ts-ignore: We don't have a proper config to test with yet
				await executor.call(executor.execute, config);
				expect(config.testValue).to.be.true;
			});

			it("should load a add-on and allow us to execute it with properties", async () => {
				const executor = await registry.load(pkgJson.name, "executor", {
					projectDir: LOAD_TEST,
				});
				const config = {
					testValue: false,
					hasProperties: true,
					expect,
				};
				// @ts-ignore: We don't have a proper config to test with yet
				await executor.call(executor.execute, config);
				expect(config.testValue).to.be.true;
			});

			it("should throw an error if we ask for an add-on that is not installed", async () => {
				await expect(registry.load("DEFO_NOT_IN_REG_" + Math.random(), "detector", { clientRoot: "UNIMPORTANT" })).to.be.rejectedWith(errorCodes.ADDON_NOT_IN_REGISTRY);
			});

			it("should throw an error if we load a type not in the package", async () => {
				try {
					await registry.load(pkgJson.name, "pack", {});
				} catch (err) {
					expect(err.message).to.include("Add-on of type");
					return;
				}
				throw new Error("No error thrown when one was expected!");
			});

			it("should throw an error if loading from DB fails for other reasons", async () => {
				await registry.install(join(__dirname, "non-mocha/loadTest3malformedDB"), { local: true });
				const pkgJSON = require(join(__dirname, "non-mocha/loadTest3malformedDB/package.json"));
				const db = await open({
					filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME),
					driver: sqlite3.Database,
				});
				await db.exec(`UPDATE ${REGISTRY_TABLE_NAME} SET info = "{}" WHERE name = "${pkgJSON.name}"`);
				await expect(registry.load(pkgJSON.name, "executor", {})).to.be.rejectedWith(errorCodes.ADDON_DB_LOAD_FAIL);
				await registry.uninstall(pkgJSON.name);
			});

			it("should successfully load all add-ons of a given type", async () => {
				// Install stuff
				await registry.install(join(__dirname, "non-mocha", "loadTest"), { local: true });
				await registry.install(join(__dirname, "non-mocha", "loadTest2"), { local: true });
				const pkgJson2 = require(join(__dirname, "non-mocha", "loadTest2", "package.json"));
				// now check
				const res = await registry.loadAllOfType("executor");
				expect(res).to.have.property(pkgJson.name);
				expect(res).to.have.property(pkgJson2.name);
				expect(Object.keys(res)).to.be.of.length(3);
				const testOBJ = {
					testValue: false,
					testValue2: false,
					expect,
				};
				// Exec
				// @ts-ignore: We don't have a proper config to test with yet
				await res[pkgJson.name].call(res[pkgJson.name].execute, testOBJ);
				// @ts-ignore: We don't have a proper config to test with yet
				await res[pkgJson2.name].call(res[pkgJson2.name].execute, testOBJ);
				expect(testOBJ.testValue).to.be.true;
				expect(testOBJ.testValue2).to.be.true;

			}).timeout(50000);

			it("createLoaderForAddonType(): should return a loader for a specific add-on type only", async () => {
				// Install stuff
				await registry.install(join(__dirname, "non-mocha", "loadTestMultiType"), { local: true });
				const theLoader = registry.createLoaderForAddonType(TWOKEYS_ADDON_TYPE_EXECUTOR);
				// @ts-expect-error
				(await theLoader("load-test-multi-type")).execute();
			});
		});
	});
});
