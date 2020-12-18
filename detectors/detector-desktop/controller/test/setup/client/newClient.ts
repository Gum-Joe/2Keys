import { ClientConfig } from "@twokeys/core/lib/interfaces";
import chai, { expect } from "chai";
import chaiJSONSchema from "chai-json-schema";
import chaiFS from "chai-fs";
import { join } from "path";
import sinon from "sinon";
import { ClientConfigHere } from "../../../src/config";
import newClient from "../../../src/setup/client/newClient";
import * as vmCode from "../../../src/setup/client/vm";
import { MOCK_2KEYS_HOME_CONFIG, MOCK_CLIENT_LOCATION, twokeys } from "../../constants";
import { promises as fs } from "fs";
import { PROVISION_CONFIG_STORAGE, VAGRANT_FILE_DEST, VM_LAUNCH_BAT_FILE_DEST, VM_LAUNCH_VBS_FILE_DEST } from "../../../src/constants";

chai.use(chaiJSONSchema);
chai.use(chaiFS);

// For coverage
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import detectorFull from "../../../src/index";
import { loadConfig } from "@twokeys/core/lib/config";

const coreConstants = require("@twokeys/core/lib/constants");

// Property access check
detectorFull.install;

// VAUES FOR TESTS ONLY AS THEY DON'T MATTER
const clientConfig: ClientConfig<ClientConfigHere> = {
	id: "sodkfhakjshdf",
	name: "test",
	controller: "@twokeys/detector-desktop",
	controllerConfig: {
		perms: {
			addToStartup: false,
			allowAutoUpdate: false,
		},
		keyboards: [{
			filterName: "Filter1",
			vendorID: "0x1a86",
			productID: "0x7523",
			uuid: "UNKNOWN", // Will be included
			address: "UNKNOWN2",
		}], // TODO
		projects: [{
			path: process.cwd(),
			ansibleProvisioner: "ansible/base/provision.yml"
		}],
		executables: {},
	}
};

const checkForUSB = "vb.customize ['usbfilter', 'add', '0', '--target', :id, '--name', 'Filter1', '--vendorid', '0x1a86', '--productid', '0x7523']";
const checkForAnsible = "ansible.playbook = \"/vagrant/ansible/base/provision.yml\"";

describe("Client creation tests", () => {
	before(() => {
		sinon.replace(vmCode, "startVM", async () => {return;});

		// REPLACE 2KeysHOME
		sinon.replace(coreConstants, "TWOKEYS_MAIN_CONFIG_DEFAULT_PATH", MOCK_2KEYS_HOME_CONFIG);
	});

	it("should successfully generate a client, with created configs matching schemas", async () => {
		await expect(newClient(twokeys, clientConfig)).to.eventually.be.fulfilled;

		expect((await fs.readFile(join(MOCK_CLIENT_LOCATION, VAGRANT_FILE_DEST))).toString()).to.include(checkForUSB);
		expect((await fs.readFile(join(MOCK_CLIENT_LOCATION, VAGRANT_FILE_DEST))).toString()).to.include(checkForAnsible);
		
		// Check templates
		expect((await fs.readFile(join(MOCK_CLIENT_LOCATION, VM_LAUNCH_BAT_FILE_DEST))).toString()).to.include(`cd "${MOCK_CLIENT_LOCATION}"`);
		expect((await fs.readFile(join(MOCK_CLIENT_LOCATION, VM_LAUNCH_VBS_FILE_DEST))).toString()).to.include(`"cmd /c '${join(MOCK_CLIENT_LOCATION, VM_LAUNCH_BAT_FILE_DEST)}'"`);
	
		// Check against schemas
		const provisionSchema = require("@twokeys/detector-desktop-schemas/src/client-side-provisioning-config.json");
		expect(join(MOCK_CLIENT_LOCATION, PROVISION_CONFIG_STORAGE)).to.be.a.file();
		// @ts-ignore
		expect(await loadConfig(join(MOCK_CLIENT_LOCATION, PROVISION_CONFIG_STORAGE))).to.be.jsonSchema(provisionSchema);

	});

	it("should respect custom vagrant paths in config", async () => {
		await expect(newClient(twokeys, {
			...clientConfig,
			controllerConfig: {
				...clientConfig.controllerConfig,
				executables: {
					vagrant: process.cwd(),
				}
			}
		})).to.eventually.be.fulfilled;
		expect((await fs.readFile(join(MOCK_CLIENT_LOCATION, VM_LAUNCH_BAT_FILE_DEST))).toString()).to.include(`"${process.cwd()}" up`);
	});

	after(() => {
		sinon.restore();
	});
});