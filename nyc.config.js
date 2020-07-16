module.exports = {
	extends: "@istanbuljs/nyc-config-typescript",
	include: [
		"src/**/*.ts",
		"src/*.ts"
	],
	reporter: [
		"text-summary",
		"html",
		"lcov",
		"json"
	],
	sourceMap: true,
	instrument: true
};