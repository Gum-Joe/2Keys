

// NOTE: Use ./config/nyc.config.js for modules"

module.exports = {
	...require("./config/nyc.config.js"),
	include: [
		"packages/@twokeys/*/src/**",
		"executors/@twokeys/*/src/**"
	],
	all: true,
};