import { createMockTwoKeys, AddOnsRegistry, TWOKEYS_ADDON_TYPE_DETECTOR } from "@twokeys/addons";
import { TwoKeys } from "@twokeys/addons";
import { MOCK_REGISTRY_LOCATION, MOCK_ROOT } from "../../../../executors/@twokeys/executor-ahk/test/constants";

import packageJSON from "../package.json";

import install from "../src/install";

const twokeys = createMockTwoKeys(packageJSON, new AddOnsRegistry(MOCK_REGISTRY_LOCATION).registryDBFilePath, { projectDir: MOCK_ROOT }) as unknown as TwoKeys<TWOKEYS_ADDON_TYPE_DETECTOR>;

(async function (): Promise<void> {
	await install(twokeys);
})();