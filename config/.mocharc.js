// Mocha config file

module.exports = {
	require: ["ts-node/register", "source-map-support/register"],
	recursive: true,
	spec: ["test/**.ts", "test/**/*.ts"],
	extension: ["ts", "js"],
	exclude: ["test/non-mocha"],
	"unhandled-rejections": "strict",
	timeout: 50000,
}
