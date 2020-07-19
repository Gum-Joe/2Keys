const { promises } = require("fs");
const { join } = require("path");

// Install test
exports.install = async (twokeys) => {
	twokeys.logger.info("Installing...");
	await promises.open(join(__dirname, "../registry/test.txt"), "w");
	twokeys.logger.info(`File created at ${join(__dirname, "../registry/test.txt")}`);
}