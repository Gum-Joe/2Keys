/** Runs a command */
import CommandFactory from "../common/command-factory";
import BaseTwoKeysForCommands, { ensureIsValidTwoKeysClass } from "../common/twokeys";
import { Logger, TwoKeysProperties } from "@twokeys/core";
import { CommandInfo } from "../common/base-commands";
import commands from "../commandsList";
import { TWOKEYS_DEFAULT_REGISTRY_ROOT } from "@twokeys/addons";
import { join } from "path";

@ensureIsValidTwoKeysClass
class Twokeys extends BaseTwoKeysForCommands {
	constructor(commandInfo: CommandInfo, properties: TwoKeysProperties) {
		super(Logger, commandInfo, properties);
	}
}

const factory = new CommandFactory(Twokeys);

const logger = new Logger({
	name: "spike",
})

// WARNING! Computer specific!
/*factory.callCommand(commands.oobe, {
	pcName: "server",
	didAcceptLicense: true,
	registryRoot: TWOKEYS_DEFAULT_REGISTRY_ROOT,
	networkAdapter: "Network Bridge",
	ipv4Address: "192.168.0.50",
	// TODO: Create test module
	addonInstallListList: [],
	force: true,
}).catch(err => {
	logger.printError(err);
	process.exit(1);
})*/

factory.callCommand(commands.createProject, {
	projectName: "test_project",
	projectLocation: join(__dirname, "../../testing"),
	projectUuid: "1",
	permissions: {
		allowSync: false,
	},
	serverInfo: {
		serverPort: 4000,
		permissions: {
			allowStartup: false,
		}
	}
}).catch(err => {
	logger.printError(err);
	process.exit(1);
})