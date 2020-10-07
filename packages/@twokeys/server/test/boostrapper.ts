import { CommandFactory, BaseTwoKeysForCommands, ensureIsValidTwoKeysClass, CommandInfo }  from "@twokeys/common-hi/lib/common";
import { Logger, TwoKeysProperties } from "@twokeys/core";
import { AddOnsRegistry, SoftwareRegistry } from "@twokeys/addons/src";
import { SOFTWARE_TABLE_NAME } from "@twokeys/addons/lib/util/constants";
import { join } from "path";
import { loadMainConfig, stringifyMainConfig } from "@twokeys/core/lib/config";
import { promises as fs } from "fs";
 
const logger = new Logger({
	name: "bootstrap",
});

export const MOCK_ROOT = join(__dirname, "../testing");
export const MOCK_PROJECT_ROOT = join(MOCK_ROOT, "project");
export const MOCK_REGISTRY = join(MOCK_ROOT, "registry");
export const MOCK_KBD = "keyboard_1";
export const MOCK_KDB_ROOT = join(MOCK_PROJECT_ROOT, "Keyboard_1");
export const MOCK_2KEYS_HOME = join(MOCK_ROOT, "2KeysHome");

@ensureIsValidTwoKeysClass
export class TwoKeys extends BaseTwoKeysForCommands {
	constructor(commandInfo: CommandInfo, properties: TwoKeysProperties) {
		super(Logger, commandInfo, properties);
	}
}

export default async (): Promise<void> => {
	logger.info("Bootstraping test project");
	logger.info("Adjusting main config");
	const mainConfig = await loadMainConfig(join(MOCK_2KEYS_HOME, "config.yml"));
	mainConfig.registry_root = MOCK_REGISTRY;
	await fs.writeFile(join(MOCK_2KEYS_HOME, "config.yml"), stringifyMainConfig(mainConfig))
	//logger.warn("Please run `/scripts/link-test-packages.sh` first.");
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

	logger.info("Wiping software registry");
	// Also, wipe software dir
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	await registry.registry.run(`DELETE FROM ${SOFTWARE_TABLE_NAME}`);
	try {
		const ahk = await registry.loadExecutor("@twokeys/executor-ahk", {});
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		await ahk.call(ahk.install, {});
	} catch (err) {
		logger.err(err.message);
		return;
	} finally {
		// @ts-expect-error
		await registry.registry.close();
	}
};
