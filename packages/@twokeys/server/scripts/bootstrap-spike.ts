import { CommandFactory, BaseTwoKeysForCommands, ensureIsValidTwoKeysClass, CommandInfo }  from "@twokeys/common-hi/lib/common";
import { Logger, TwoKeysProperties } from "@twokeys/core";
import { AddOnsRegistry, SoftwareRegistry } from "@twokeys/addons";
import { join } from "path";

const logger = new Logger({
	name: "bootstrap",
});

const MOCK_ROOT = join(__dirname, "../spike");
const MOCK_REGISTRY = join(MOCK_ROOT, "registry");

@ensureIsValidTwoKeysClass
export class TwoKeys extends BaseTwoKeysForCommands {
	constructor(commandInfo: CommandInfo, properties: TwoKeysProperties) {
		super(Logger, commandInfo, properties);
	}
}

(async (): Promise<void> => {
	logger.info("Bootstraping test project");
	logger.warn("Please run `/scripts/link-test-packages.cmd` first.");
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const factory = new CommandFactory(TwoKeys);

	await AddOnsRegistry.createNewRegistry(MOCK_REGISTRY);
	await SoftwareRegistry.createSoftwareRegistry(MOCK_REGISTRY);

	logger.info("Installing packages");
	const registry = new AddOnsRegistry(MOCK_REGISTRY);
	await registry.install("@twokeys/executor-ahk");
	await registry.install("@twokeys/detector-desktop");
})();
