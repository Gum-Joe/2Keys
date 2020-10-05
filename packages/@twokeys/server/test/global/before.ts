import boostrapper from "../boostrapper";
import { MOCK_ROOT } from "./constants";

/**
 * Before file to setup tests
 */

// Bootstrap setup
before(async () => {
	//process.chdir(MOCK_ROOT);
	await boostrapper();
});
