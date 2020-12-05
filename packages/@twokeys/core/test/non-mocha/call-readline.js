// NOTE: Ensure you have compiled things before running
const { Logger } = require("../../lib");

const logger = new Logger({ name: "test" });
logger.prompts.info("Please read this.").then(() => {
	logger.info("Done with test");
	process.exit(0);
});
