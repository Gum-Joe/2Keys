import { AddOnsRegistry, TWOKEYS_ADDON_TYPE_EXECUTOR } from "@twokeys/addons";
import { logger } from "./api";

export async function loadExecutors(registry: AddOnsRegistry) {
	logger.info("Loading executors for use...");
	return registry.loadAllOfType(TWOKEYS_ADDON_TYPE_EXECUTOR);
}
