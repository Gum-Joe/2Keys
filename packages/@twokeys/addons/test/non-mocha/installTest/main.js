const { promises } = require("fs");
const { join } = require("path");

// Install test
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
exports.install = async (twokeys) => {
	twokeys.logger.info("Installing...");
	await promises.open(join(__dirname, "../registry/test.txt"), "w");
	twokeys.logger.info(`File created at ${join(__dirname, "../registry/test.txt")}`);
};