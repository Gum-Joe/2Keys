/**
 * Tests the registry code
 */
import { join } from "path";
import chai from "chai";
import fs from "fs";
import rimraf from "rimraf";
//import Datastore from "nedb-promises";
import AddOnsRegistry from "../src/registry";
import { REGISTRY_FILE_NAME } from "../src/constants";
import { PackageInDB, TWOKEYS_ADDON_TYPES_ARRAY } from "../src/interfaces";
import { TWOKEYS_ADDON_TYPE_EXECUTOR } from "../src/interfaces";

chai.use(require("chai-fs"));

const { expect } = chai;

const REGISTRY_DIR = join(__dirname, "non-mocha", "registry");
const EXECUTOR_TEST = join(__dirname, "non-mocha", "executor1");

describe("Registry tests", () => {

	before((done) => {
		rimraf(REGISTRY_DIR, (err) => {
			done(); // Do not handle error, since we just want to delete it if not there
		});
	});
	
	it("should create a registry", async () => {
		await AddOnsRegistry.createNewRegistry(REGISTRY_DIR);
		expect(REGISTRY_DIR).to.be.a.directory();
		expect(REGISTRY_DIR).to.include.files(["package.json", REGISTRY_FILE_NAME]);
	});

	it("should sucessfully install a package and NOT add it to the registry", async () => {
		const registry = new AddOnsRegistry(REGISTRY_DIR);
		await registry.install("mkdirp");
		expect(join(REGISTRY_DIR, "node_modules")).to.be.a.directory();
		expect(join(REGISTRY_DIR, "node_modules", "mkdirp")).to.be.a.directory();
		// Check DB
		// const db = new Datastore({ filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME), autoload: true });
		/*db.find({ name: "mkdirp" }, (err, docs) => {
			if (err) { throw err; }
			expect(docs).to.be.of.length(0);
		});*/
	}).timeout(50000);

	it("should sucessfully install an executor and add it to the registry", async () => {
		const registry = new AddOnsRegistry(REGISTRY_DIR);
		const pkgJSON = require(join(EXECUTOR_TEST, "package.json"));
		const status = await registry.install(EXECUTOR_TEST, { local: true });
		// tslint:disable-next-line: no-unused-expression
		expect(status.status).to.be.true;
		expect(join(REGISTRY_DIR, "node_modules")).to.be.a.directory();
		expect(join(REGISTRY_DIR, "node_modules", pkgJSON.name)).to.be.a.directory();
		// Check DB
		/*const db = Datastore.create({ filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME), autoload: true });
		db.find({ name: pkgJSON.name }, (err, docs: PackageInDB[]) => {
			if (err) { throw err; }
			expect(docs).to.be.of.length(1);
			expect(docs[0].name).to.be(pkgJSON.name);
			expect(docs[0].name).to.be(pkgJSON.name);
			expect(docs[0].types).to.be.equal([TWOKEYS_ADDON_TYPE_EXECUTOR]);
			expect(docs[0].info.version).to.be(pkgJSON.version);
			expect(docs[0].entry.executor).to.be(pkgJSON.twokeys.entry.executor);
		});*/
	}).timeout(50000);
	
	it("should not duplicate a package in the registry", async () => {
		const registry = new AddOnsRegistry(REGISTRY_DIR);
		const pkgJSON = require(join(EXECUTOR_TEST, "package.json"));
		const status = await registry.addPackage(pkgJSON.name);
		// tslint:disable-next-line: no-unused-expression
		expect(status.status).to.be.false;
		// Check DB
		/*const db = Datastore.create({ filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME), autoload: true });
		db.find({ name: pkgJSON.name }, (err, docs: PackageInDB[]) => {
			if (err) { throw err; }
			expect(docs).to.be.of.length(1);
		});*/
	}).timeout(50000);

	it("should duplicate a package in the registry when force: true is passed", async () => {
		const registry = new AddOnsRegistry(REGISTRY_DIR);
		const pkgJSON = require(join(EXECUTOR_TEST, "package.json"));
		const status = await registry.addPackage(pkgJSON.name, {
			force: true,
		});
		// tslint:disable-next-line: no-unused-expression
		expect(status.status).to.be.true;
		// Check DB
		/*const db = Datastore.create({ filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME), autoload: true });
		db.find({ name: pkgJSON.name }, (err, docs: PackageInDB[]) => {
			if (err) { throw err; }
			expect(docs).to.be.of.length(2);
			expect(docs[0]).to.deep.equal(docs[1]);
		});*/
	}).timeout(50000);
});
