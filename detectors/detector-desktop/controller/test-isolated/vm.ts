import { TwoKeys, createMockTwoKeys, AddOnsRegistry, TWOKEYS_ADDON_TYPE_DETECTOR } from "@twokeys/addons";
import { ClientConfig } from "@twokeys/core/lib/interfaces";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { join } from "path";
import { ClientConfigHere } from "../src/config";
import newClient from "../src/setup/client/newClient";
import { MOCK_REGISTRY_LOCATION, MOCK_ROOT } from "../test/constants";
import packageJSON from "../package.json";
import { exec } from "child_process";
import { promisify } from "util";
import { BAD_VAGRANT_EXIT_CODE } from "../src/errorCodes";
import { startVM } from "../src/setup/client/vm";

chai.use(chaiAsPromised);

const MOCK_CLIENT_ROOT_HERE = join(MOCK_ROOT, "client-vm");

const twokeys = createMockTwoKeys(packageJSON, new AddOnsRegistry(MOCK_REGISTRY_LOCATION).registryDBFilePath, {
	projectDir: MOCK_ROOT,
	clientRoot: MOCK_CLIENT_ROOT_HERE
}) as unknown as TwoKeys<TWOKEYS_ADDON_TYPE_DETECTOR>;

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
		keyboards: [], // TODO
		projects: [],
		executables: {},
	}
};

describe("VM Startup tests", () => {
	it("should start a VM and provision it correctly", async () => {
		await expect(newClient(twokeys, clientConfig)).to.eventually.be.fulfilled;
		await expect(promisify(exec)("vagrant ssh -c 2Keys --help")).to.eventually.be.fulfilled;
	}).timeout(600000);

	it("should throw an error if vagrant has a non zero exit code", async () => {
		const twokeysHere = createMockTwoKeys(packageJSON, new AddOnsRegistry(MOCK_REGISTRY_LOCATION).registryDBFilePath, {
			projectDir: MOCK_ROOT,
			clientRoot: join(MOCK_CLIENT_ROOT_HERE, "config") // No vagrantfile will force vagrant to exit with non-zero exit code
		}) as unknown as TwoKeys<TWOKEYS_ADDON_TYPE_DETECTOR>;
		await expect(startVM(twokeysHere, clientConfig.controllerConfig)).to.eventually.be.rejectedWith(BAD_VAGRANT_EXIT_CODE);
	}).timeout(30000);

	after(function (done) {
		this.timeout(600000);
		exec("vagrant halt", {
			cwd: MOCK_CLIENT_ROOT_HERE
		}, (error) => {
			if (error) done(error);
			setTimeout(() => {
				exec("vagrant destroy -f", {
					cwd: MOCK_CLIENT_ROOT_HERE
				}, done);
			}, 5000);
		});
	});
});