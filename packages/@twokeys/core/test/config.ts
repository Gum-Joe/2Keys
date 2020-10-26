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
 * Tests config parsing
 */
import path from "path";
import mkdirp from "mkdirp";
import YAML from "yaml";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { promises as fs, constants as fsconstants } from  "fs";
import { getAStringifyer, loadClientConfig, loadConfig, loadDetectorConfig, loadMainConfig, loadProjectConfig } from "../src/config";
import { TWOKEYS_MAIN_CONFIG_DEFAULT_PATH, TWOKEYS_PROJECT_CONFIG_FILENAME } from "../src/constants";
import { AddConfigUtils, ClientConfig, DetectorConfig, MainConfig, ProjectConfig } from "../src/interfaces";
import getClientConfigPath from "../src/getClientConfigPath";

// Setup
chai.use(chaiAsPromised);
const { expect } = chai;

const CONFIG_FILE = path.join(__dirname, "non-mocha", "test.yml");
const EXAMPLE_PROJECT = path.join(__dirname, "../../../../example");

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

	it("should successfully be able to stringfy a config", async () => {
		const loaded = await loadConfig(CONFIG_FILE);

		expect(YAML.parse(getAStringifyer()(loaded))) // It stands to reason that a valid config will be parsable!
			.to.deep.equal(loaded);
	});

	describe("Individual config types", () => {
		before(async () => {
			// Create file if it does not exist
			try {
				await fs.access(TWOKEYS_MAIN_CONFIG_DEFAULT_PATH, fsconstants.F_OK);
			} catch (err) {
				if (err.code === "ENOENT") {
					// Create
					await mkdirp(path.dirname(TWOKEYS_MAIN_CONFIG_DEFAULT_PATH));
					await fs.writeFile(TWOKEYS_MAIN_CONFIG_DEFAULT_PATH, "name: test\nversion: 1.0.0\n");
				} else {
					throw err;
				}
			}
		});
		
		describe("Main config", () => {
			it("should sucessfully load the main config", async () => {
				// Will fail with a compile error if TS types go bad.
				const mainConfigLoad: MainConfig = await loadMainConfig();
				expect(mainConfigLoad).to.be.a("object");
			});
		});

		describe("Project config", () => {
			it("should load the project config correctly", async () => {
				// Use example project (so we don't have to make ANOTHER mock)
				// Will fail with a compile error if TS types go bad.
				const loadedProjected: ProjectConfig = await loadProjectConfig(EXAMPLE_PROJECT);
				expect(loadedProjected).to.deep.equal(
					YAML.parse(
						(await fs.readFile(
							path.join(EXAMPLE_PROJECT, TWOKEYS_PROJECT_CONFIG_FILENAME))).toString())
				);
			});

			it("should throw an error trying to load a non-project, or a bad path", async () => {
				// For example, __dirname is not a project!
				await expect(loadProjectConfig(__dirname)).to.be.rejectedWith("INVALID_PROJECT");
			});
		});

		describe("Detector (project specific config)", () => {
			it("should load a detector config", async () => {
				// Will fail with a compile error if TS types go bad.
				const detectorConfig: DetectorConfig = await loadDetectorConfig(path.join(EXAMPLE_PROJECT, "detector-pi.yml"));
				expect(detectorConfig).to.deep.equal(
					YAML.parse(
						(await fs.readFile(path.join(EXAMPLE_PROJECT, "detector-pi.yml"))).toString()
					)
				);
			});
		});

		describe("Client config loading", () => {
			it("should load a config, allow us to write to it, and not accidentally add extra stuff", async () => {
				const configPath = getClientConfigPath(path.join(EXAMPLE_PROJECT, "client"), "00000");
				const configRightNow = await loadConfig(configPath);
				const loadedConfig: AddConfigUtils<ClientConfig> = await loadClientConfig(configPath);
				expect(loadedConfig).to.deep.include(configRightNow);
				// Atttempt write
				await loadedConfig.write();
				// Check
				expect(await loadConfig(configPath)).to.deep.equal(configRightNow);
			});
		});
	});
});