/** 
 * Tests config parsing
 */
import path from "path";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { promises as fs, constants as fsconstants } from  "fs";
import { loadConfig, loadServerConfig } from "../src/config";
import { CONFIG_DEFAULT_FILE_SERVER } from "../src/constants";

// Setup
chai.use(chaiAsPromised);
const { expect } = chai;

const CONFIG_FILE = path.join(__dirname, "non-mocha", "test.yml");

describe("Config tests", () => {
	it("should successfully load the config", async () => {
		await expect(loadConfig(CONFIG_FILE)).to.eventually.deep.equal({
			hello: "world",
			a: "AN_A",
			complexOBJ: {
				hello: "world2",
				someArray: ["hi"]
			},
			someArray: ["hi"]
		});
	});
	it("should throw an error when an FS error is encountered", async () => {
		await expect(loadConfig(__dirname)).to.be.rejected;
	});

	describe("Individual config loads", () => {
		before(async () => {
			// Create file if it does not exist
			try {
				await fs.access(CONFIG_DEFAULT_FILE_SERVER, fsconstants.F_OK);
			} catch (err) {
				if (err?.code === "ENOENT") {
					// Create
					await fs.writeFile(CONFIG_DEFAULT_FILE_SERVER, "name: test\nversion: 1.0.0\n");
				}
			}
		});
		it("should sucessfully load the server config", async () => {
			await expect(loadServerConfig()).to.eventually.be.a("object");
		});
	});
});