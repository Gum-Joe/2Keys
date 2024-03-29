/**
 * @license
 * Copyright 2020 Kishan Sambhi
 *
 * This file is part of 2Keys.
 *
 * 2Keys is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 2Keys is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * Defines everything to do with prompts, and getting user input.
 * The implementation here, which are for the CLI, should be overrided by the GUI.
 * 
 * **THE GUI VERSION OF THE PROMPTS CLASS SHOULD NOT CALL THESE (FROM SUPER.METHOD()) AS IT MAY HANG EXECUTION,
 * as there will be no way to provide CLI input (STDIN) on the GUI**
 * @packageDocumentation
 */
import { createInterface } from "readline";
import type Logger from "./logger";
import titleCase from "./titlecase";

/* eslint-disable @typescript-eslint/explicit-function-return-type */


/**
 * Valid types for prompts, in order of severity
 */
const enum PromptTypes {
	info = "info",
	question = "question",
	warning = "warning",
	/** Use only for the most critical error, that require the stopping of the program.  Ideally, just throw an error and let 2Keys handle it */
	error = "error",
}

/**
 * Defines the functions a {@link Prompts} needs to implement.
 * One for each of {@link PromptTypes}
 * FIXME: Reimplement so these are dyanmically generated from the above enum
 */
export interface PromptsInterfaces {
	[PromptTypes.info]: PromptFunctionType;
	[PromptTypes.question]: PromptFunctionType;
	[PromptTypes.warning]: PromptFunctionType;
	[PromptTypes.error]: (err: Error) => void;
}

/**
 * The type ALL prompt provider funcs implement
 * @param message Message to prompt with
 * @param config Config for prompts, likely onl
 */
export type PromptFunctionType = (message: string, config?: any) => Promise<PromptResponse>;

/**
 * Config type for prompt function that asks a question ({@link Prompts.warning} and {@link Prompts.question})
 */
export interface PromptConfig {
	/** Button to use. defaults to yes or no (y/n) */
	buttons?: string[];
	/** Index of default button (option) in button array. */
	defaultButton?: number;
}

/**
 * Config type for the private basePrompt func
 * The specific config for the GUI is somewhere else.
 */
export interface BasePromptFunctionConfig extends PromptConfig {
	// type: PromptTypes[];
	logger: (text: string) => void;
}

/** The response type that is returned by all promps */
export interface PromptResponse {
	/** Index of button/option selected */
	response: number;
	/**
	 * **GUI ONLY** please note this property is only available on the GUI,
	 * we highly reccomend not relying on it to be there as the functionality is not available on the GUI.
	 * 
	 * The checked state of the checkbox if a checkbox Label was given
	 */
	checkboxChecked?: boolean;
}

/** Options */
export interface PromptOptions {
	nonInteractive: boolean;
}


/**
 * Handles prompts for the logger, so that commands using a twokeys object can have interactivity with users on both CLI and GUI,
 * especially for alerts (see {@link Prompts.warning}) and important info messages.
 * 
 * NOTE: If logger.isSilent is true, prompts will still be given, but info messages will be skipped.
 */
export default class Prompts implements PromptsInterfaces {
	/** Constants */
	/**
	 * Provides the options to use for a yes no question,
	 * should be overriden by GUI to Yes and No.
	 */
	public YES_NO = ["y", "n"];
	protected logger: Logger;
	/**
	 * Turn off interactivity
	 * Useful when testing
	 */
	// HACK: Used as a test shortcut to return default or 0 when TWOKEYS_NONINTERACTIVE is true.
	// TODO: Allow a --no-interactive options eventually
	// TODO: Better docs for TWOKEYS_NONINTERACTIVE - currently undocumented
	public nonInterative = process.env.TWOKEYS_NONINTERACTIVE === "true";

	constructor(logger: Logger, options?: Partial<PromptOptions>) {
		this.logger = logger;
		if (options?.nonInteractive) {
			this.nonInterative = options.nonInteractive;
		}
	}

	/**
	 * Base function used to prompt for a simple, mutli-choice response from the user.
	 * Allows defaults as well.
	 * 
	 * Options (buttons) are printed in lowercase, with default in titlecase.  Responses are normalised and compared to normalised options (all in lower case).
	 * 
	 * **Please use one of the wrappers of this function, {@link Prompts.question} or {@link Prompts.warning}, instead of this.**
	 * 
	 * @param message Message (question) to prompt with 
	 * @param config Config - see type.
	 * @returns Index of button (option) that was selected - see {@link Promps.YES_NO} for default buttons
	 * 
	 * Example (NB: Omit buttons field to use {@link Prompts.YES_NO} as default):
	 * @example
	 * ```typescript
	 * const logger = new Logger({ name: "example" })
	 * // NOTE: omit buttons below to use Prompts.YES_NO as default
	 * // NOTE: Use .warning for alerts and non-critcal errors where the user is given several options to proceed (including proceeding or halting).
	 * const res = await logger.prompts.question("Install this optional package?", { buttons: ["Yes", "No"], defaultButton: 0 })
	 * console.log(res);
	 * ```
	 * Output:
	 * ```
	 * 7/4/2020 10:05:12 PM spike info
	 * 7/4/2020 10:05:12 PM spike info Install this optional package? [Yes/no]
	 * yes // inputed by user, if they hit enter it automatically selects Yes
	 * { response: 0 } // return to you by the function (see: console.log(res))
	 * ```
	 */
	protected async basePrompt(message: string, config: BasePromptFunctionConfig): Promise<PromptResponse> {
		const originalSilenceState = this.logger.isSilent ? true : false;
		this.logger.isSilent = false; // Allow logging
		config.logger("");
		if (typeof config.buttons === "undefined") {
			config.buttons = this.YES_NO;
		}
		// Generate options
		const SEPARATOR = "/";
		// Normalise the buttons to lowercase so it's easier to look for it
		const normalisedOptions = config.buttons.map(value => value.toLowerCase());
		const optionsArray = [...normalisedOptions]; // Copy for options
		// Use this to generate the options -> the default is made into titlecase
		if (typeof config.defaultButton !== "undefined") {
			optionsArray[config.defaultButton] = titleCase(optionsArray[config.defaultButton]);
		}
		const options = optionsArray.join(SEPARATOR);

		config.logger(`${message} [${options}]`);

		// Get response index
		// HACK: Test shortcut to return default or 0 when TWOKEYS_NONINTERACTIVE is true.
		// TODO: Allow a --no-interactive options eventually
		// TODO: Better docs for TWOKEYS_NONINTERACTIVE - currently undocumented
		/* istanbul ignore next */
		if (this.nonInterative) {
			this.logger.warn(`Returning value of ${config.buttons[config.defaultButton ?? 0]} as TWOKEYS_NONINTERACTIVE is set.`);
			this.logger.warn("This may lead to undetermined behaviour when no default (Titlecase) option is specified by the code!");
			if (originalSilenceState) { // I.e. was silent
				this.logger.isSilent = true; // Reset back to true
			}
			return {
				response: config.defaultButton ?? 0,
			};
		}
		const responseLiteral = await Prompts.getInputPromise();
		const responseIndex = normalisedOptions.indexOf(responseLiteral.toLowerCase());
		if (responseIndex < 0) {
			// if the raw input is nothing, then just use default
			if (typeof config.defaultButton !== "undefined" && responseLiteral === "") {
				return { response: config.defaultButton };
			} else {
				config.logger("Invalid response.");
				return this.basePrompt(message, config);
			}
		}
		if (originalSilenceState) { // I.e. was silent
			this.logger.isSilent = true; // Reset back to true
		}
		return { response: responseIndex };
	}

	/**
	 * On CLI, pauses execution so the user can read an important piece of info.
	 * To not halt execution, please just use {@link Logger.info}.
	 * 
	 * **Only use this function for information you want the user to definitly see and confirm they have seen - {@link Logger.info} is enough for most things**
	 * @see BasePromptType
	 * @returns On CLI this means nothing, on GUI it indicates if OK was pressed.
	 */
	public async info(message: string) {
		if (!this.logger.isSilent && !this.nonInterative) {
			this.logger.info("");
			this.logger.info(message);
			//this.logger.info("");
			this.logger.info("Press enter to continue.");
			await Prompts.getInputPromise("");
		} // If it is silent, we skil info messages
		return { response: 0 };
	}

	/**
	 * Asks a question, using .info as the logger.
	 * Used for simple, multichoice questions (or info boxes in the GUI)
	 * @see Prompts.basePrompt (for more (important) info & example)
	 * @see PromptFunctionType
	 */
	public question(message: string, config: PromptConfig = {}) {
		return this.basePrompt(message, { ...config, logger: (message: string) => this.logger.info(message) });
	}

	/**
	 * Alerts the user to something (usually a non-critical error) and provides them options to proceed with (including proceeding vs. halting).
	 * Akin is JS's own alert(), except async. (**Do not user the global alert() as it blocking**)
	 * @see Prompts.basePrompt (for more (important) info & example)
	 * @see PromptFunctionType
	 */
	public warning(message: string, config: PromptConfig = {}) {
		return this.basePrompt(message, { ...config, logger: (message: string) => this.logger.warn(message) });
	}

	/**
	 * Used to _display_ an error.
	 * In the CLI this is a wrapper around {@link Logger.printError},
	 * but in the GUI this will display a error message box to the user.
	 * 
	 * **Please don't use this yourself, instead, throw an error and let 2Keys handle the error.  2Keys will log the error and show it to the user.**
	 * 
	 * An error in this context is either "this function can't continue" or "this entire process must be stopped because xyz" - but 2Keys itself will handle what to do for each case
	 * @param err Error the display
	 */
	// NOTE: Not tested as it just calls logger.printError, which is already tested
	/* istanbul ignore next */
	public error(err: Error) {
		this.logger.printError(err);
	}

	/**
 	 * Wrap rl in a promise for us
 	 */
	// NOTE: Tested by test/non-mocha/call-readline.js
	// This file is spawned by the tests, so nyc can't track it, hence we ask nyc (istanbul) to ignore it
	/* istanbul ignore next */
	public static getInputPromise(question = ""): Promise<string> {
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout
		});
		return new Promise((resolve) => rl.question(question, input => {
			resolve(input);
			rl.close();
		}));
	}
}