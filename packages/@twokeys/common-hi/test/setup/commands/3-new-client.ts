/* eslint-disable @typescript-eslint/explicit-function-return-type */
import factory from "../../test-util/command-factory";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import chaiFs from "chai-fs";
import commands from "../../../src/commandsList";
import { AddOnsRegistry, createMockTwoKeys, DetectorController, LoadedAddOn, TWOKEYS_ADDON_TYPE_DETECTOR } from "@twokeys/addons";
import * as addons from "@twokeys/addons/src";
import sinon from "sinon";
import { basename, join, relative } from "path";
import * as constants from "@twokeys/core/lib/constants";
import { MOCK_TWOKEYS_HOME_ROOT } from "../../test-util/constants";
import mkdirp from "mkdirp";
import { promisify } from "util";
import rimrafCB from "rimraf";
import { REGISTRY_FILE_NAME } from "@twokeys/addons/src";
import { loadClientConfig } from "@twokeys/core/lib/config";

const rimraf = promisify(rimrafCB);

chai.use(chaiFs);
chai.use(chaiAsPromised);

const twokeys = createMockTwoKeys(require("@twokeys/detector-desktop/package.json"), join(MOCK_TWOKEYS_HOME_ROOT, "registry", REGISTRY_FILE_NAME));

const mockModule: LoadedAddOn<TWOKEYS_ADDON_TYPE_DETECTOR> = {
	setup: {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		setupNewClient: {
			generateConfig: sinon.spy(function (_twokeys, config) { return config; }),
			setup: sinon.spy(),
		}
	},
	package: require("../../../package.json"),
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	call: (fn, config) => fn(twokeys, config),
};

class MockRegistry extends AddOnsRegistry {
	loadDetector = async () => {
		return mockModule;
	}
}

const mockConfig = {
	id: "101011",
	name: "Test",
	controller: "@twokeys/detector-desktop",
	config: JSON.stringify({
		perms: {
			addToStartup: false,
			allowAutoUpdate: true,
		},
		keyboards: []
	})
};

describe("New Client Creation Tests", () => {
	before(async () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		sinon.replaceGetter(addons, "AddOnsRegistry", () => MockRegistry);
		// sinon.replace(constants, "TWOKEYS_HOME", join(MOCK_TWOKEYS_HOME_ROOT));
		sinon.replace(constants, "TWOKEYS_CLIENTS_ROOT", join(MOCK_TWOKEYS_HOME_ROOT, basename(constants.TWOKEYS_CLIENTS_ROOT)));
		sinon.replace(constants, "TWOKEYS_CLIENTS_CONFIG_ROOT", join(constants.TWOKEYS_CLIENTS_ROOT, basename(constants.TWOKEYS_CLIENTS_CONFIG_ROOT)));
		sinon.replace(constants, "TWOKEYS_CONFIG_HOME", join(MOCK_TWOKEYS_HOME_ROOT, basename(constants.TWOKEYS_CONFIG_HOME)));
		sinon.replace(constants, "TWOKEYS_MAIN_CONFIG_DEFAULT_PATH", join(MOCK_TWOKEYS_HOME_ROOT, relative(constants.TWOKEYS_HOME, constants.TWOKEYS_MAIN_CONFIG_DEFAULT_PATH)));
		await mkdirp(join(MOCK_TWOKEYS_HOME_ROOT, basename(constants.TWOKEYS_CLIENTS_ROOT), basename(constants.TWOKEYS_CLIENTS_CONFIG_ROOT)));
		await rimraf(join(MOCK_TWOKEYS_HOME_ROOT, basename(constants.TWOKEYS_CLIENTS_ROOT), basename(constants.TWOKEYS_CLIENTS_CONFIG_ROOT)));
		await mkdirp(join(MOCK_TWOKEYS_HOME_ROOT, basename(constants.TWOKEYS_CLIENTS_ROOT), basename(constants.TWOKEYS_CLIENTS_CONFIG_ROOT)));
	});
	
	it("should successfully create a client", async () => {
		await factory.callCommand(commands.newClient, mockConfig);

		// Validate right funcs were called
		expect((mockModule.setup.setupNewClient.generateConfig as sinon.SinonSpy).calledOnce).to.be.true;
		expect((mockModule.setup.setupNewClient.setup as sinon.SinonSpy).calledOnce).to.be.true;

		// Validate creationg
		expect(join(constants.TWOKEYS_CLIENTS_CONFIG_ROOT, `client-${mockConfig.id}`)).to.exist;
		expect(await loadClientConfig(join(constants.TWOKEYS_CLIENTS_CONFIG_ROOT, `client-${mockConfig.id}.yml`))).to.deep.include({
			controller: mockConfig.controller,
			controllerConfig: JSON.parse(mockConfig.config),
		});
	});

	after(() => {
		sinon.restore();
	});
});