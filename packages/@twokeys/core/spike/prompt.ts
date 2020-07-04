import Logger from "../src/logger";

const logger = new Logger({
	name: "spike"
});
(async function (): Promise<void> {
	logger.info("HELLO THERE");
	await logger.prompts.info("IMPORTANT! PLEASE READ!");

	logger.info("GENERAL KENOBI");
	console.log(await logger.prompts.warning("Do you wish to proceed?"));
})();

