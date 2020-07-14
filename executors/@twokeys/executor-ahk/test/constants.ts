import path from "path";

export const MOCK_ROOT = path.join(__dirname, "non-mocha");
export const MOCK_REGISTRY_LOCATION = path.join(MOCK_ROOT, "registry");
export const MOCK_CONFIG_LOCATION = path.join(MOCK_ROOT, "config.yml");
export const CONFIG_FILE = path.join(MOCK_ROOT, "./config.yml");
export const MOCK_KEYBAORD_NAME = "keyboard_test";