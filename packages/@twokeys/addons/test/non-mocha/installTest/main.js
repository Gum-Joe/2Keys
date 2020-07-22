const { promises } = require("fs");
const { join } = require("path");
const { expect } = require("chai");
const { TwoKeys } = require("../../../src/module-interfaces");
const TwoKeysFromCore = require("@twokeys/core/lib/twokeys");

// Install test
exports.install = async (twokeys) => {
	twokeys.logger.info("Installing...");
	await promises.open(join(__dirname, "../registry/test.txt"), "w");
	twokeys.logger.info(`File created at ${join(__dirname, "../registry/test.txt")}`);
}