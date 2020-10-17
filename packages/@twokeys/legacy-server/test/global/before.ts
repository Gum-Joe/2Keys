import { join } from "path";
import { MOCK_ROOT } from "./constants";

/**
 * Before file to setup tests
 */

// Set root dir so file are located correctly
before(() => {
	process.chdir(MOCK_ROOT);
});
