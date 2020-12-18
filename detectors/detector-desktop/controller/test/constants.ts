import { AddOnsRegistry, createMockTwoKeys, TwoKeys, TWOKEYS_ADDON_TYPE_DETECTOR } from "@twokeys/addons";
import path from "path";
import packageJSON from "../package.json";

export const MOCK_ROOT = path.join(__dirname, "non-mocha");
export const MOCK_REGISTRY_LOCATION = path.join(MOCK_ROOT, "registry");
export const MOCK_CLIENT_LOCATION = path.join(MOCK_ROOT, "client");
export const MOCK_CONFIG_LOCATION = path.join(MOCK_ROOT, "config.yml");
export const CONFIG_FILE = path.join(MOCK_ROOT, "./config.yml");
export const MOCK_KEYBAORD_NAME = "keyboard_test";
export const MOCK_2KEYS_HOME = path.join(MOCK_ROOT, "2KeysHome");
export const MOCK_2KEYS_HOME_CONFIG = path.join(MOCK_2KEYS_HOME, "config/config.yml");

export const twokeys = createMockTwoKeys(packageJSON, new AddOnsRegistry(MOCK_REGISTRY_LOCATION).registryDBFilePath, {
	projectDir: MOCK_ROOT,
	clientRoot: MOCK_CLIENT_LOCATION
}) as unknown as TwoKeys<TWOKEYS_ADDON_TYPE_DETECTOR>;