import { MOCK_REGISTRY_LOCATION } from "./constants";
import rimrafCB from "rimraf";
import { promisify } from "util";
import { AddOnsRegistry, SoftwareRegistry } from "@twokeys/addons";
import { twokeys } from "./constants";
import install from "../src/install";
import { VAGRANT_DEFAULT_INSTALL_PATH, VAGRANT_EXECUTABLE_NAME, VAGRANT_NAME, VBOX_DEFAULT_INSTALL_PATH, VIRTUALBOX_EXECUTABLE_NAME, VIRTUALBOX_NAME } from "../src/constants";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import mockFS from "mock-fs";

const rimraf = promisify(rimrafCB);

chai.use(chaiAsPromised);

describe("Install function tests", () => {
	before(async () => {
		try { await rimraf(MOCK_REGISTRY_LOCATION); } catch (err) { if (err.code !== "ENOENT") throw err; }
		await AddOnsRegistry.createNewRegistry(MOCK_REGISTRY_LOCATION);
		await SoftwareRegistry.createSoftwareRegistry(MOCK_REGISTRY_LOCATION);
	});

	it("should run install", async () => {
		const mockFS_here = {};
		mockFS_here[VAGRANT_DEFAULT_INSTALL_PATH] = VAGRANT_DEFAULT_INSTALL_PATH;
		mockFS_here[VBOX_DEFAULT_INSTALL_PATH] = VBOX_DEFAULT_INSTALL_PATH;
		mockFS(mockFS_here);
		await install(twokeys);
		await expect(twokeys.software.getSoftware(VAGRANT_NAME)).to.eventually.be.fulfilled;
		await expect(twokeys.software.getSoftware(VIRTUALBOX_NAME)).to.eventually.be.fulfilled;
		mockFS.restore();
	});

	it("should use the correct paths for vagrant", async () => {
		const mockFS_here = {};
		mockFS_here[VAGRANT_DEFAULT_INSTALL_PATH] = VAGRANT_DEFAULT_INSTALL_PATH;
		mockFS_here[VBOX_DEFAULT_INSTALL_PATH] = VBOX_DEFAULT_INSTALL_PATH;
		mockFS(mockFS_here);
		expect((await twokeys.software.getSoftware(VAGRANT_NAME)).executables.filter(exe => exe.name === VAGRANT_EXECUTABLE_NAME)[0].path).to.equal(VAGRANT_DEFAULT_INSTALL_PATH);
		mockFS.restore();
	});

	it("should use the correct paths for vbox", async () => {
		const mockFS_here = {};
		mockFS_here[VAGRANT_DEFAULT_INSTALL_PATH] = VAGRANT_DEFAULT_INSTALL_PATH;
		mockFS_here[VBOX_DEFAULT_INSTALL_PATH] = VBOX_DEFAULT_INSTALL_PATH;
		mockFS(mockFS_here);
		const thePath = (await twokeys.software.getSoftware(VIRTUALBOX_NAME)).executables.filter(exe => exe.name === VIRTUALBOX_EXECUTABLE_NAME)[0].path;
		// HACK: Hack to ignore slashes
		expect(thePath.split("").map(char => char !== "\\" ? char : "" ).join("")).to.equal(VBOX_DEFAULT_INSTALL_PATH.split("").map(char => char !== "\\" ? char : "" ).join(""));
		mockFS.restore();
	});

	describe("Getting Paths", () => {
		it("should throw an error when vagrant is not found", async () => {
			const mockFS_here = {};
			mockFS(mockFS_here);
			await expect(install(twokeys)).to.be.rejectedWith("Vagrant not found");
			mockFS.restore();
		});

		it("should throw an error when VBox is not found", async () => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			/*sinon.replaceGetter(fs, "promises", () => { return {
				access: async (path: PathLike) => {
					if (path === await which("vagrant") || path === VAGRANT_DEFAULT_INSTALL_PATH) {
						return;
					}
					throw new CodedError("", "ENOENT");
				},
			};});*/
			const mockFS_here = {};
			mockFS_here[VAGRANT_DEFAULT_INSTALL_PATH] = "content";
			mockFS(mockFS_here);
			await expect(install(twokeys)).to.be.rejectedWith("VirtualBox not found");
			mockFS.restore();
		});

		it("should use environment variables when set for VBox", async () => {
			const mockFS_here = {};
			mockFS_here[VAGRANT_DEFAULT_INSTALL_PATH] = VAGRANT_DEFAULT_INSTALL_PATH;
			mockFS_here[VBOX_DEFAULT_INSTALL_PATH] = VBOX_DEFAULT_INSTALL_PATH;
			mockFS(mockFS_here);
			process.env.VBOX_INSTALL_PATH  = process.cwd();
			await twokeys.software.uninstallSoftware(VIRTUALBOX_NAME);
			await twokeys.software.uninstallSoftware(VAGRANT_NAME);
			await install(twokeys);
			expect((await twokeys.software.getExecutable(VIRTUALBOX_NAME, VIRTUALBOX_EXECUTABLE_NAME)).path).to.equal(process.cwd());
			mockFS.restore();
		});

		it("should use default install path for VBox when no env vars", async () => {
			const mockFS_here = {};
			mockFS_here[VAGRANT_DEFAULT_INSTALL_PATH] = VAGRANT_DEFAULT_INSTALL_PATH;
			mockFS_here[VBOX_DEFAULT_INSTALL_PATH] = VBOX_DEFAULT_INSTALL_PATH;
			mockFS(mockFS_here);
			delete process.env.VBOX_INSTALL_PATH;
			delete process.env.VBOX_MSI_INSTALL_PATH;
			await twokeys.software.uninstallSoftware(VIRTUALBOX_NAME);
			await twokeys.software.uninstallSoftware(VAGRANT_NAME);
			await install(twokeys);
			expect((await twokeys.software.getExecutable(VIRTUALBOX_NAME, VIRTUALBOX_EXECUTABLE_NAME)).path).to.equal(VBOX_DEFAULT_INSTALL_PATH);
			mockFS.restore();
		});
	});
});