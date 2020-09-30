import { AddOnsRegistry, TWOKEYS_ADDON_TYPE_EXECUTOR } from "@twokeys/addons";
import { logger } from "./api";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function loadExecutors(registry: AddOnsRegistry, projectDir: string) {
	logger.info("Loading executors for use...");
	return registry.loadAllOfType(TWOKEYS_ADDON_TYPE_EXECUTOR, {
		projectDir,
	});
}
