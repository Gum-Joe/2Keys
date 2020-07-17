module.exports = {
	extends: "@istanbuljs/nyc-config-typescript",
	all: true,
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