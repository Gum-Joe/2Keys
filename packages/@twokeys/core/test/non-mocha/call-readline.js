// NOTE: Ensure you have compiled things before running
import { Logger } from "@twokeys/core";

const logger = new Logger({ name: "test" });
logger.prompts.info("Please read this.").then(() => {
	logger.info("Done with test");
	process.exit(0);
});
