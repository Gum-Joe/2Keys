import Logger from "../src/logger";

const logger = new Logger({
	name: "spike"
});
(async function (): Promise<void> {
	logger.info("HELLO THERE");
	await logger.prompts.info("IMPORTANT! PLEASE READ!");

	logger.info("GENERAL KENOBI");
	logger.warn("GENERAL KENOBI");
	console.log(await logger.prompts.warning("Do you wish to proceed?"));
	console.log(await logger.prompts.warning("Do you wish to proceed?", { defaultButton: 0 }));
	console.log(await logger.prompts.question("Do you wish to proceed?", { buttons: ["Maybe", "Nope"], defaultButton: 1 }));
	logger.info("SEPARATOR");
	logger.prompts.error(new Error("Hello there"));
})();

