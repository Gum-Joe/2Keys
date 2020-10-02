import { Logger } from "@twokeys/core";
import type { RequestHandler } from "express";
import { CodedError } from "@twokeys/core";
import { ERR_BAD_EVENT_TYPE } from "../util/errCodes";
import { hasOwnProperty } from "../util/hasOwnProperty";
import type { ExecutorExecConfig } from "@twokeys/addons";
import type { HotkeyTypeKeypressValue, DetectorConfig, Hotkey, HotkeyTypeSingle, Keyboard } from "@twokeys/core/lib/interfaces";
import type { loadExecutors } from "./loadExecutors";

export const logger: Logger = new Logger({
	name: "api:hotkeys",
});

type ExtractGeneric<Type> = Type extends Promise<infer X> ? X : never

/**
 * Checks if a hotkey is a multi (i.e. has separate up, down and hold macros)
 * @returns true if hotkey is {@link HotkeyTypeKeypressValue}
 * @param hotkey 
 */
function isMultiHotkey(hotkey: Hotkey): hotkey is HotkeyTypeKeypressValue {
	if (hasOwnProperty(hotkey, "up") || hasOwnProperty(hotkey, "down") || hasOwnProperty(hotkey, "hold")) {
		return true;
	} else {
		return false;
	}
}

/**
 * Actually calls an executor
 * @param hotkey Hotkey config to execute
 * @param hotkeyCode Key of the hotkey in `keyboard.hotkeys` (e.g. `^A`)
 * @param keyboard Config of keyboard being executed for
 * @param executors Loaded executors
 */
// TODO: Execute on a different thread, because the server hangs and fails any in progress runs if it is still waiting for this
// TODO: Normalise hotkeys so they are all in lowercase, since ^A and ^a are the same key.  (might not be needed though, as detectors should read directly from config)
export async function executeHotKey(hotkey: HotkeyTypeSingle, hotkeyCode: string, keyboard: Keyboard, executors: ExtractGeneric<ReturnType<typeof loadExecutors>>): Promise<void> {
	logger.info(`Executing hotkey ${hotkey}...`);
	const executorToCall = hotkey.executor || keyboard.executors.default;
	const configForExecutor: ExecutorExecConfig<{ [key: string]: any }> = {
		hotkey: {
			...(keyboard.executors[executorToCall] || {}), // Falback in case no config
			...hotkey,
		},
		hotkeyCode,
		executorDefaultConfig: (keyboard.executors[executorToCall] || {}),
		keyboard,
	};
	logger.debug(`Providing ${JSON.stringify(configForExecutor)} to executor`);
	if (!hasOwnProperty(executors, executorToCall)) {
		logger.err(`Executor ${executorToCall} not found installed!`);
		throw new CodedError("Executor to use not found!", "ENOENT");
	}
	await executors[executorToCall].call(executors[executorToCall].execute, configForExecutor);
	return;
}

/**
 * Trigger a hotkey
 *
 * Provide these property:
 * ```json
 * {
 * 	"hotkey": "^A" // hotkey code to find in keyboard
 * 	"event": "up" | "down" | "hold" // OPTIONAL event type
 * }
 * ```
 * 
 * NOTE: The `event` key will be ignored if the hotkey is not type multi
 * 
 * @param detectors Loaded detector configs to use
 * @param executor Loaded executors from registry
 * @returns Exprss route handler for triggering a hotkey
 */
const getTriggerHotkey = (detectors: Map<string, DetectorConfig>, executors: ExtractGeneric<ReturnType<typeof loadExecutors>>): RequestHandler  => {
	return function (req, res, next): void {
		const { detector: detectorName, keyboard: keyboardName } = req.params;
		logger.info(`Got trigger for detector ${detectorName}, keyboard ${keyboardName}`);

		// 0: Validate information given
		logger.info("Validating POST body");
		if (!hasOwnProperty(req, "body") || typeof req.body !== "object" || typeof req.body.hotkey !== "string") {
			logger.err("Invalid POST body! Properties were missing!");
			res.statusCode = 422;
			res.json({
				message: "Invalid POST body! Properties were missing!",
			});
			return;
		}

		// Check that if an event (e.g. up press, down press or hold) is provided it is valid
		const hotkey = req.body.hotkey as string;
		const eventType: keyof HotkeyTypeKeypressValue = req.body.event || "down";
		if (eventType !== "up" && eventType !== "down" && eventType !== "hold") {
			logger.err("Bad event field given!");
			res.statusCode = 422;
			res.json({
				message: "Bad event field given!",
			});
			return;
		}

		// 1: Grab config of the detector to use
		logger.debug(`Grabbing config for detector ${detectorName}, keyboard ${keyboardName}...`);
		if (!detectors.has(detectorName)) {
			logger.err(`Detector ${detectorName} not found!`);
			res.statusCode = 404;
			res.json({
				message: "Detector Not Found"
			});
			return;
		}
		const detector = detectors.get(detectorName) as DetectorConfig;
		if (hasOwnProperty(detector.keyboards, keyboardName)) { // Check the keyboard is present
			logger.debug(`Keyboard ${keyboardName} found`);
			const keyboard = detector.keyboards[keyboardName];

			if (!hasOwnProperty(keyboard.hotkeys, hotkey)) { // Check hotkey is present
				logger.err(`Hotkey ${hotkey} not found!`);
				res.statusCode = 404;
				res.json({
					message: "Hotkey Not Found"
				});
				return;
			}

			const theHotkey = keyboard.hotkeys[hotkey];
			let configToGive: HotkeyTypeSingle;
			// Set the config above to the single macro being called (extract the config from a mutil type if needed)
			if (isMultiHotkey(theHotkey)) {
				logger.debug("Got a multi type hotkey!");
				if (typeof theHotkey[eventType] !== "object") {
					res.statusCode = 422;
					res.json({
						message: `Hotkey event type ${eventType} not found`
					});
					return;
				} else {
					configToGive = theHotkey[eventType] as HotkeyTypeSingle;
				}
			} else {
				configToGive = theHotkey;
			}

			// EXECUTE!
			executeHotKey(configToGive, hotkey, keyboard, executors)
				.catch(next)
				.then(() => {
					logger.info("Execution done.");
				});
			// Send back to prevent timeout from long hotkeys
			res.statusCode = 200;
			res.json({
				message: "Run triggered",
			});
			res.end();
			return;

		} else { // from the if checking if the keybaord was in the detector config
			logger.err(`Keyboard ${keyboardName} not found!`);
			res.statusCode = 404;
			res.json({
				message: "Keyboard Not Found"
			});
			return;
		}
	};
};

export default getTriggerHotkey; 