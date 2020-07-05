// Mocha config file

module.exports = {
	"r": "ts-node/register",
	"recursive": true,
	"spec": ["packages/@twokeys/*/test/*.ts", " packages/@twokeys/*/test/**/*.ts", "executors/@twokeys/*/test/*.ts"],
	"exclude": ["packages/@twokeys/server/test/**/*.ts"],
	"unhandled-rejections": "strict",
	"timeout": 50000,
}
