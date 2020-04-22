/**
 * Tests the registry code
 */
import { join } from "path";
import chai from "chai";
import rimraf from "rimraf";
import Datastore from "nedb";
import AddOnsRegistry from "../src/registry";
import { REGISTRY_FILE_NAME } from "../src/constants";

chai.use(require("chai-fs"));

const { expect } = chai;

const REGISTRY_DIR = join(__dirname, "non-mocha", "registry");
const EXECUTOR_TEST = join(__dirname, "non-mocha", "executor1");

describe("Registry tests", () => {
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
		const db = new Datastore({ filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME), autoload: true });
		db.find({ name: "mkdirp" }, (err, docs) => {
			if (err) { throw err; }
			expect(docs).to.be.of.length(0);
		});
	}).timeout(50000);

	it("should sucessfully install an executor and add it to the registry", async () => {
		const registry = new AddOnsRegistry(REGISTRY_DIR);
		const pkgJSON = require(join(EXECUTOR_TEST, "package.json"));
		await registry.install(EXECUTOR_TEST, { local: true });
		expect(join(REGISTRY_DIR, "node_modules")).to.be.a.directory();
		expect(join(REGISTRY_DIR, "node_modules", pkgJSON.name)).to.be.a.directory();
		// Check DB
		/*const db = new Datastore({ filename: join(REGISTRY_DIR, REGISTRY_FILE_NAME), autoload: true });
		db.find({ name: pkgJSON.name }, (err, docs) => {
			if (err) { throw err; }
			expect(docs).to.be.of.length(0);
		});*/
	}).timeout(50000);
});
