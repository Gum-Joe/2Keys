import { AddOnsRegistry, TWOKEYS_ADDON_TYPE_EXECUTOR } from "@twokeys/addons";
import { Logger } from "@twokeys/core";

export const logger: Logger = new Logger({
	name: "registry",
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function loadExecutors(registry: AddOnsRegistry, projectDir: string) {
	logger.info("Loading executors for use...");
	return registry.loadAllOfType(TWOKEYS_ADDON_TYPE_EXECUTOR, {
		projectDir,
	});
}
