/**
 * Native module definiton
 */
const native = require("../build/Release/setup.node");

/**
 * Native module exports for setup
 */
export interface NativeModuleExports {
	get_startup_folder: () => string;
}

export default (native as NativeModuleExports);