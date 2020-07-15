// Mocha config file

module.exports = {
	"r": ["ts-node/register", "source-map-support/register"],
	"recursive": true,
	"spec": "test/*.ts",
	"unhandled-rejections": "strict",
	"timeout": 50000,
}
