import chai, { expect } from "chai";
import { join } from "path";
import { promises as fs } from "fs";
import rimrafCB from "rimraf";

import { config as configLoader } from "@twokeys/core";
import { DetectorConfig } from "@twokeys/core/lib/interfaces";
import { TwoKeys, TWOKEYS_ADDON_TYPE_EXECUTOR } from "@twokeys/addons";
import AddOnsRegistry from "@twokeys/addons/lib/registry";
import SoftwareRegistry from "@twokeys/addons/lib/software";
import { createMockTwoKeys } from "@twokeys/addons/lib/dev-tools";

import packageJSON from "../package.json";
import { MOCK_REGISTRY_LOCATION, MOCK_CONFIG_LOCATION, MOCK_KEYBAORD_NAME, MOCK_ROOT } from "./constants";

import run_hotkey, { ThisExecutorConfig } from "../src/exec";
import install from "../src/install";
import { promisify } from "util";

const rimraf = promisify(rimrafCB);

chai.use(require("chai-as-promised"));

let config: DetectorConfig | any;

const twokeys = createMockTwoKeys(packageJSON, new AddOnsRegistry(MOCK_REGISTRY_LOCATION).registryDBFilePath, { projectDir: MOCK_ROOT }) as unknown as TwoKeys<TWOKEYS_ADDON_TYPE_EXECUTOR>;

describe("AHK execution tests", () => {

	before(async () => {
		config = await configLoader.loadConfig<DetectorConfig>(MOCK_CONFIG_LOCATION);
		await AddOnsRegistry.createNewRegistry(MOCK_REGISTRY_LOCATION);
		await SoftwareRegistry.createSoftwareRegistry(MOCK_REGISTRY_LOCATION);
		await install(twokeys, {});
	});

	it("should successfully execute a hotkey", async () => {
		// TODO: Map root file to absolute path
		const configHere: ThisExecutorConfig = {
			hotkey: { ...config.keyboards[MOCK_KEYBAORD_NAME].hotkeys["^RT"], ...config.keyboards[MOCK_KEYBAORD_NAME].executors["executor-ahk"] },
			executorDefaultConfig: config.keyboards[MOCK_KEYBAORD_NAME].executors["executor-ahk"],
			hotkeyCode: "^RT",
			keyboard: config.keyboards[MOCK_KEYBAORD_NAME],
		};
		await run_hotkey(
			twokeys,
			configHere,
		);
		expect(
			(await fs.readFile(join(MOCK_ROOT, MOCK_KEYBAORD_NAME, "./RunTestForExecution1.txt"))).toString(),
		).to.equal("IT WORKED!");
		twokeys.logger.debug("Test done.");
		return;
	});

	/**it("should throw a ReferenceError when attmepting to call a non-existant keyboard", async () => {
		await expect(fetch_hotkey(MOCK_KEYBAORD_NAME + "NOTAKEYBOARD", "+B$HOME$")).to.be.rejectedWith(ReferenceError);
	});

	it("should throw a ReferenceError when attmepting to call a non-existant host", async () => {
		await expect(fetch_hotkey(MOCK_KEYBAORD_NAME, "INVALID")).to.be.rejectedWith(ReferenceError);
	});**/

	after(async () => {
		twokeys.logger.debug("Running after hook." );
		await twokeys.software.db.close();
		twokeys.logger.debug("DB closed.");
		// Delete file
		await rimraf(MOCK_REGISTRY_LOCATION);
		twokeys.logger.debug("Files delted.");
		await fs.unlink(join(MOCK_ROOT, MOCK_KEYBAORD_NAME, "./RunTestForExecution1.txt"));
		twokeys.logger.debug("Test file gone.");
		twokeys.logger.debug("Tests done.");
	});
});
