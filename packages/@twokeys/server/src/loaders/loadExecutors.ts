import { AddOnsRegistry, LoadedAddOn, TWOKEYS_ADDON_TYPE_EXECUTOR } from "@twokeys/addons";
import { Logger } from "@twokeys/core";

export const logger: Logger = new Logger({
	name: "registry",
});

export function loadExecutors(registry: AddOnsRegistry, projectDir: string): Promise<Record<string, LoadedAddOn<TWOKEYS_ADDON_TYPE_EXECUTOR>>> {
	logger.info("Loading executors for use...");
	return registry.loadAllOfType(TWOKEYS_ADDON_TYPE_EXECUTOR, {
		projectDir,
	});
}
