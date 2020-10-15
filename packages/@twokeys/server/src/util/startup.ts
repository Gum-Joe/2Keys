import { CodedError } from "@twokeys/core";
import { ATTEMPT_AT_ADMIN } from "./errCodes";
import isAdmin from "./is-admin";
import Logger from "./logger";

const logger: Logger = new Logger({
	name: "security",
});

/**
 * Function to run on startup that does required pre-server init tasks
 * 
 * This is namely detecting if 2Keys is being ran as admin,
 * which is disallowed as a non-protected config (i.e weritable by any user) could be used by malware for priverlege esculation
 */
export default async function startupScripts(): Promise<void> {
	if (await isAdmin()) {
		logger.err("Error! Detected that you're running as admin!");
		logger.err("You can't run 2Keys as admin for security reasons!");
		logger.err("This is because malware could adjust your (non-admin protected) config to execute malware for priverlege esculation.");
		logger.err("Please file an issue if you want to run 2Keys as admin.");
		const err = new CodedError("Detected you're running as admin! 2Keys can't be ran as admin for security reasons (see above)!", ATTEMPT_AT_ADMIN);
		logger.printError(err);
		// And exit,
		process.exit(1);
	} else {
		logger.debug("Not running as admin.");
	}
}
