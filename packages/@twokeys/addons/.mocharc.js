// Mocha config file

module.exports = {
	...require("../../../config/.mocharc.js"),
	recursive: false,
	spec: ["test/*"],
	exclude: ["test/non-mocha/*", "test/non-mocha/**/*"],
	timeout: 50000,
}
