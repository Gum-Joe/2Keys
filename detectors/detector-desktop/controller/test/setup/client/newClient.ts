import { ClientConfig } from "@twokeys/core/lib/interfaces";
import { expect } from "chai";
import { join } from "path";
import sinon from "sinon";
import { ClientConfigHere } from "../../../src/config";
import newClient from "../../../src/setup/client/newClient";
import * as vmCode from "../../../src/setup/client/vm";
import { MOCK_CLIENT_LOCATION, twokeys } from "../../constants";
import { promises as fs } from "fs";
import { VAGRANT_FILE_DEST } from "../../../src/constants";

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
			uuid: "UNKNOWN",
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
		sinon.replace(vmCode, "startVM", sinon.mock());
	});

	it("should successfully generate a client", async () => {
		await expect(newClient(twokeys, clientConfig)).to.eventually.be.fulfilled;
		expect((await fs.readFile(join(MOCK_CLIENT_LOCATION, VAGRANT_FILE_DEST))).toString()).to.include(checkForUSB);
		expect((await fs.readFile(join(MOCK_CLIENT_LOCATION, VAGRANT_FILE_DEST))).toString()).to.include(checkForAnsible);
	});
	after(() => {
		sinon.restore();
	});
});