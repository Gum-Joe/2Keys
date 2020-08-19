import sinon from "sinon";
import * as constants from "@twokeys/core/lib/constants";
import { join, relative, basename } from "path";
import mkdirp from "mkdirp";

import factory from "../../test-util/command-factory";
import oobe from "../../../src/setup/commands/oobe";
import rimrafCB from "rimraf";
import chai, { expect } from "chai";
import chaiFs from "chai-fs";
import chaiAsPromised from "chai-as-promised";
import { loadMainConfig, stringifyMainConfig } from "@twokeys/core/lib/config";
import { CodedError } from "@twokeys/core";
import { promises as fs } from "fs";
import { promisify } from "util";

const rimraf = promisify(rimrafCB);

const MOCK_TWOKEYS_HOME_ROOT = join(__dirname, "../../non-mocha/2Keys-Home");
const TEST_OOBE_CONFIG = {
	pcName: "test-server-1",
	didAcceptLicense: true,
	registryRoot: join(MOCK_TWOKEYS_HOME_ROOT, "registry"),
	networkAdapter: "Network Bridge",
	ipv4Address: "192.168.0.50",
	// TODO: Create test module
	addonInstallListList: ["debug"],
	options: {
		force: false,
		noIpv4Set: true,
	}
}



chai.use(chaiFs);
chai.use(chaiAsPromised);

describe("Setup Tests", () => {
	describe("OOBE Tests", () => {
		before(async () => {
			// Clear previous run
			await rimraf(MOCK_TWOKEYS_HOME_ROOT);
			await mkdirp(MOCK_TWOKEYS_HOME_ROOT);
			sinon.replace(constants, "TWOKEYS_CONFIG_HOME", join(MOCK_TWOKEYS_HOME_ROOT, basename(constants.TWOKEYS_CONFIG_HOME)));
			sinon.replace(constants, "TWOKEYS_MAIN_CONFIG_DEFAULT_PATH", join(MOCK_TWOKEYS_HOME_ROOT, relative(constants.TWOKEYS_HOME, constants.TWOKEYS_MAIN_CONFIG_DEFAULT_PATH)));
			await mkdirp(require("@twokeys/core/lib/constants").TWOKEYS_CONFIG_HOME);
		});

		it("should succesfully create a config with all the right options, and install add-on", async () => {
			//console.log(constants.TWOKEYS_MAIN_CONFIG_DEFAULT_PATH);
			await factory.callCommand(oobe, TEST_OOBE_CONFIG);

			// Validate
			expect(constants.TWOKEYS_MAIN_CONFIG_DEFAULT_PATH).to.be.a.file();
			await expect(loadMainConfig(constants.TWOKEYS_MAIN_CONFIG_DEFAULT_PATH)).to.eventually.deep.equal({
				name: TEST_OOBE_CONFIG.pcName,
				version: require("../../../package.json").version,
				registry_root: join(MOCK_TWOKEYS_HOME_ROOT, "registry"),
				oobe: true,
				network: {
					adapter: TEST_OOBE_CONFIG.networkAdapter,
					ipv4: TEST_OOBE_CONFIG.ipv4Address,
				}
			});
			// Add-ons check
			expect(require(join(MOCK_TWOKEYS_HOME_ROOT, "registry", "package.json")).dependencies).to.have.key("debug");
		});

		it("should throw an error when the license agreement is not accepted", async () => {
			await expect(factory.callCommand(oobe, { ...TEST_OOBE_CONFIG, didAcceptLicense: false })).to.be.rejectedWith(CodedError);
		});

		it("should not do anything when config already exists and force is false", async () => {
			await expect(factory.callCommand(oobe, {
				...TEST_OOBE_CONFIG,
				pcName: "not_correct", // This we check for
				options: {
					...TEST_OOBE_CONFIG.options,
					force: false,
				}
			})).to.be.eventually.fulfilled;

			const returned = await loadMainConfig(constants.TWOKEYS_MAIN_CONFIG_DEFAULT_PATH);
			expect(returned.name).to.equal(TEST_OOBE_CONFIG.pcName);
		});

		it("should overwrite existing config if oobe: false", async () => {
			// Modify
			await fs.writeFile(
				constants.TWOKEYS_MAIN_CONFIG_DEFAULT_PATH,
				stringifyMainConfig(
					{ ...await loadMainConfig(), oobe: false, }
				)
			);
			await expect(factory.callCommand(oobe, {
				...TEST_OOBE_CONFIG,
				pcName: "should_be_this", // This we check for
			})).to.be.eventually.fulfilled;

			const returned = await loadMainConfig(constants.TWOKEYS_MAIN_CONFIG_DEFAULT_PATH);
			expect(returned.name).to.equal("should_be_this");
			expect(returned.oobe).to.be.true;
		});

		after(function () {
			sinon.restore();
		});
	});
});
