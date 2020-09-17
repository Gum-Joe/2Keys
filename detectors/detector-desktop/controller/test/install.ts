import { MOCK_REGISTRY_LOCATION, MOCK_ROOT } from "./constants";
import rimrafCB from "rimraf";
import { promisify } from "util";
import { createMockTwoKeys, AddOnsRegistry, TWOKEYS_ADDON_TYPE_DETECTOR, SoftwareRegistry } from "@twokeys/addons";
import { TwoKeys } from "@twokeys/addons";
import { MOCK_CLIENT_LOCATION } from "./constants";
import packageJSON from "../package.json";
import install from "../src/install";
import { VAGRANT_DEFAULT_INSTALL_PATH, VAGRANT_EXECUTABLE_NAME, VAGRANT_NAME, VBOX_DEFAULT_INSTALL_PATH, VIRTUALBOX_EXECUTABLE_NAME, VIRTUALBOX_NAME } from "../src/constants";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import fs from "fs";
import { CodedError } from "@twokeys/core";
import sinon from "sinon";
import * as errorCodes from "../src/errorCodes";

const rimraf = promisify(rimrafCB);

chai.use(chaiAsPromised);

const twokeys = createMockTwoKeys(packageJSON, new AddOnsRegistry(MOCK_REGISTRY_LOCATION).registryDBFilePath, {
	projectDir: MOCK_ROOT,
	clientRoot: MOCK_CLIENT_LOCATION
}) as unknown as TwoKeys<TWOKEYS_ADDON_TYPE_DETECTOR>;

describe("Install function tests", () => {
	before(async () => {
		try { await rimraf(MOCK_REGISTRY_LOCATION); } catch (err) { if (err.code !== "ENOENT") throw err; }
		await AddOnsRegistry.createNewRegistry(MOCK_REGISTRY_LOCATION);
		await SoftwareRegistry.createSoftwareRegistry(MOCK_REGISTRY_LOCATION);
	});

	it("should run install", async () => {
		await install(twokeys);
		await expect(twokeys.software.getSoftware(VAGRANT_NAME)).to.eventually.be.fulfilled;
		await expect(twokeys.software.getSoftware(VIRTUALBOX_NAME)).to.eventually.be.fulfilled;
	});

	it("should use the correct paths for vagrant", async () => {
		expect((await twokeys.software.getSoftware(VAGRANT_NAME)).executables.filter(exe => exe.name === VAGRANT_EXECUTABLE_NAME)[0].path).to.equal(VAGRANT_DEFAULT_INSTALL_PATH);
	});

	it("should use the correct paths for vbox", async () => {
		expect((await twokeys.software.getSoftware(VIRTUALBOX_NAME)).executables.filter(exe => exe.name === VIRTUALBOX_EXECUTABLE_NAME)[0].path).to.equal(VBOX_DEFAULT_INSTALL_PATH + "\\");
	});

	describe("Getting Paths", () => {
		it("should throw an error when vagrant is not found", async () => {
			sinon.replace(fs.promises, "access", async () => {
				throw new CodedError("", "ENOENT");
			});
			await expect(install(twokeys)).to.be.rejectedWith(errorCodes.APPLICATION_NOT_FOUND);
		});
	});
});