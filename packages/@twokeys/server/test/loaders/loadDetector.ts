import { AddOnsRegistry } from "@twokeys/addons";
import { constants } from "@twokeys/core";
import { loadProjectConfig, stringifyDetectorConfig } from "@twokeys/core/lib/config";
import { DetectorConfig, ProjectConfig } from "@twokeys/core/lib/interfaces";
import { expect } from "chai";
import { join } from "path";
import sinon from "sinon";
import { loadDetectors } from "../../src/loaders/loadDetectors";
import { MOCK_PROJECT_ROOT, MOCK_REGISTRY, MOCK_ROOT } from "../boostrapper";
import { promises as fs } from "fs";

let projectConfig: ProjectConfig;

let registry: AddOnsRegistry;
// Used to store original config so we can reload it
let originalReloaded: DetectorConfig;

const LOADED_DETECTOR = join(MOCK_PROJECT_ROOT, "detector-reloaded.yml");

describe("Detector loading tests", () => {

	before(() => {
		sinon.replace(constants, "TWOKEYS_MAIN_CONFIG_DEFAULT_PATH", join(MOCK_ROOT, "2KeysHome/config.yml"));
		sinon.replace(constants, "TWOKEYS_CLIENTS_ROOT", join(MOCK_ROOT, "2KeysHome/client"));
		sinon.replace(constants, "TWOKEYS_CLIENTS_CONFIG_ROOT", join(MOCK_ROOT, "2KeysHome/client"));
	});

	before(async () => {
		projectConfig = await loadProjectConfig(MOCK_PROJECT_ROOT);
		registry = new AddOnsRegistry(MOCK_REGISTRY);
		await registry.initDB();
	});

	before(async () => {
		originalReloaded = Object.assign({}, (await loadDetectors(projectConfig, MOCK_PROJECT_ROOT, registry)).get("Reloaded Detector") as DetectorConfig);
	});

	it("should load detectors", async () => {
		await expect(loadDetectors(projectConfig, MOCK_PROJECT_ROOT, registry)).to.eventually.be.of.length(2);
	});

	it("should reload detectors when a change is made", async () => {
		const loaded = await loadDetectors(projectConfig, MOCK_PROJECT_ROOT, registry);
		const modified = Object.assign({}, loaded.get("Reloaded Detector") as DetectorConfig);
		modified.client.name = "CHANGED_PROP_BY_TEST" + Math.random().toFixed(3);

		await fs.writeFile(LOADED_DETECTOR, stringifyDetectorConfig(modified));

		expect(loaded.get("Reloaded Detector")).to.deep.equal(modified);
	});

	it("should reload detectors, adding new items when name changes are made and deleting old ones", async () => {
		const loaded = await loadDetectors(projectConfig, MOCK_PROJECT_ROOT, registry);
		const modified = Object.assign({}, loaded.get("Reloaded Detector") as DetectorConfig);
		modified.name = "Reloaded Detector" + (Math.random() * 100).toFixed(0);

		await fs.writeFile(LOADED_DETECTOR, stringifyDetectorConfig(modified));

		await new Promise((resolve) => setTimeout(() => resolve(), 500));

		expect(loaded.get(modified.name)).to.deep.equal(modified);
		expect(loaded.has("Reloaded Detector")).to.be.false;

	});

	after(async () => {
		const modified = Object.assign({}, originalReloaded);
		modified.name = "Reloaded Detector";
		// RESET
		await fs.writeFile(LOADED_DETECTOR, stringifyDetectorConfig(modified));
	});

	after(() => {
		sinon.restore();
	});
});