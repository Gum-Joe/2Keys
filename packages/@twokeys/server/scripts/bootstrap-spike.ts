import { CommandFactory, BaseTwoKeysForCommands, ensureIsValidTwoKeysClass, CommandInfo }  from "@twokeys/common-hi/lib/common";
import { Logger, TwoKeysProperties } from "@twokeys/core";
import { AddOnsRegistry, SoftwareRegistry } from "@twokeys/addons/src";
import { join } from "path";

const logger = new Logger({
	name: "bootstrap",
});

const MOCK_ROOT = join(__dirname, "../testing");
const MOCK_REGISTRY = join(MOCK_ROOT, "registry");

@ensureIsValidTwoKeysClass
export class TwoKeys extends BaseTwoKeysForCommands {
	constructor(commandInfo: CommandInfo, properties: TwoKeysProperties) {
		super(Logger, commandInfo, properties);
	}
}

(async (): Promise<void> => {
	logger.info("Bootstraping test project");
	logger.warn("Please run `/scripts/link-test-packages.sh` first.");
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const factory = new CommandFactory(TwoKeys);

	//await AddOnsRegistry.createNewRegistry(MOCK_REGISTRY);
	//await SoftwareRegistry.createSoftwareRegistry(MOCK_REGISTRY);

	logger.info("Installing packages");
	const registry = new AddOnsRegistry(MOCK_REGISTRY);
	//await registry.install("@twokeys/executor-ahk", { useLink: true });
	//await registry.install("@twokeys/detector-desktop", { useLink: true });
	//await registry.install(join(__dirname, "../../../../executors/@twokeys/executor-ahk"), { local: true });
	//await registry.install(join(__dirname, "../../../../detectors/detector-desktop/controller"), { local: true });
	await registry.reindex();
	const ahk = await registry.loadExecutor("@twokeys/executor-ahk", {});
	await ahk.call(ahk.install, {});
})();
