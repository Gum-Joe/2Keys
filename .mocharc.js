// Mocha config file


module.exports = {
	extends: "../../../config/.mocharc.js",
	spec: ["packages/@twokeys/*/test/*.ts", " packages/@twokeys/*/test/**/*.ts", "executors/@twokeys/*/test/*.ts"],
	exclude: ["packages/@twokeys/server/test/**/*.ts"],
	timeout: 50000,
}
