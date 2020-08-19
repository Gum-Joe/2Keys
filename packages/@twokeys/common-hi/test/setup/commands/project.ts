import factory from "../../test-util/command-factory";
import { join } from "path";
import { promisify } from "util";
import chai, { expect } from "chai";
import chaiFs from "chai-fs";
import chaiAsPromised from "chai-as-promised";
import rimrafCB from "rimraf";
import { TWOKEYS_PROJECT_CONFIG_FILENAME } from "@twokeys/core/lib/constants";

import setupProject from "../../../src/setup/commands/project";
import { ProjectConfig } from "@twokeys/core/lib/interfaces";
import { loadProjectConfig } from "@twokeys/core/lib/config";
import { DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE, WINDOWS_DAEMON_FILE_VBS, WINDOWS_DAEMON_PREFIX } from "../../../src/setup/util/constants";
import { homedir } from "os";
import { unlink } from "fs";
import daemon from "../../../src/setup/commands/daemon";

const rimraf = promisify(rimrafCB);
const MOCK_TWOKEYS_PROJECT_ROOT = join(__dirname, "../../non-mocha/mock-project");

chai.use(chaiFs);
chai.use(chaiAsPromised);

const mockConfig: ProjectConfig = {
	name: "test-project",
	id: "NOT_A_UUID",
	perms: {
		sync: false,
	},
	server: {
		port: 7171,
		perms: {
			startOnStartup: false,
		}
	},
	version: require("../../../package.json").version,
	detectors: [],
};

const STARTUP_VBS_FILE = join(homedir(), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", "Startup", `${WINDOWS_DAEMON_PREFIX}${mockConfig.name}.vbs`);

describe("Project setup tests", () => {
	it("should succesffuly setup a project (and not add to startup, but still create startup files)", async () => {
		await factory.callCommand(setupProject, {
			projectName: mockConfig.name,
			projectLocation: MOCK_TWOKEYS_PROJECT_ROOT,
			projectUuid: mockConfig.id,
			permissions: {
				allowSync: mockConfig.perms.sync,
			},
			serverInfo: {
				serverPort: mockConfig.server.port,
				permissions: {
					allowStartup: mockConfig.server.perms.startOnStartup,
				}
			}
		});

		expect(join(MOCK_TWOKEYS_PROJECT_ROOT, TWOKEYS_PROJECT_CONFIG_FILENAME)).to.be.a.file();
		await expect(loadProjectConfig(MOCK_TWOKEYS_PROJECT_ROOT)).to.eventually.deep.equal(mockConfig);

		// Startup files
		expect(join(MOCK_TWOKEYS_PROJECT_ROOT, DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE)).to.be.a.file();
		expect(join(MOCK_TWOKEYS_PROJECT_ROOT, DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE_VBS)).to.be.a.file();
	});
	

	it("should throw an error when things are undefined", async() => {
		// @ts-expect-error
		await expect(factory.callCommand(setupProject, {})).to.be.rejectedWith("server info");
		// @ts-expect-error
		await expect(factory.callCommand(setupProject, { serverInfo: {} })).to.be.rejectedWith("permissions info!");
		// @ts-expect-error
		await expect(factory.callCommand(setupProject, { serverInfo: {}, permissions: {} })).to.be.rejectedWith("permissions info for server!");
	});

	it("should create startup files AND add to startup", async () => {
		await factory.callCommand(setupProject, {
			projectName: mockConfig.name,
			projectLocation: MOCK_TWOKEYS_PROJECT_ROOT,
			projectUuid: mockConfig.id,
			permissions: {
				allowSync: mockConfig.perms.sync,
			},
			serverInfo: {
				serverPort: mockConfig.server.port,
				permissions: {
					allowStartup: true,
				}
			}
		});

		// Check Startup files
		expect(join(MOCK_TWOKEYS_PROJECT_ROOT, DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE)).to.be.a.file();
		expect(join(MOCK_TWOKEYS_PROJECT_ROOT, DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE_VBS)).to.be.a.file();
		expect(STARTUP_VBS_FILE).to.be.a.file();
	});

	describe("Additonal daemon command tests", () => {
		it("should throw an error when no project dir given", async () => {
			await expect(factory.callCommand(daemon, {})).to.be.rejected;
		});

		it("should use .2Keys as a default relative .2Keys dir", async () => {
			await expect(factory.callCommand(daemon, {
				projectLocation: MOCK_TWOKEYS_PROJECT_ROOT,
				addToStartup: false,
			}));
			// Check Startup files
			expect(join(MOCK_TWOKEYS_PROJECT_ROOT, DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE)).to.be.a.file();
			expect(join(MOCK_TWOKEYS_PROJECT_ROOT, DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE_VBS)).to.be.a.file();
		});
		
		it("should not throw an error when symbolic link in startup already exists", async () => {
			await expect(factory.callCommand(daemon, {
				projectLocation: MOCK_TWOKEYS_PROJECT_ROOT,
				relativeFilesLocationDir: DEFAULT_LOCAL_2KEYS,
				addToStartup: true,
			})).to.be.fulfilled;
			await expect(factory.callCommand(daemon, {
				projectLocation: MOCK_TWOKEYS_PROJECT_ROOT,
				relativeFilesLocationDir: DEFAULT_LOCAL_2KEYS,
				addToStartup: true,
			})).to.be.fulfilled; // Run twice JIC early runs for parent test suite are removed
			// Check Startup files
			expect(STARTUP_VBS_FILE).to.be.a.file();
		});
	});

	after((done) => {
		// Delete stuff
		unlink(STARTUP_VBS_FILE, done);
	});
});
