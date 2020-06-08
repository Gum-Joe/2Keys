/** 
 * Tests config parsing
 */
import path from "path";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadConfig } from "../src/config";

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
	})
});