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
 * **THE GUI SHOULD NOT CALL THESE AS IT MAY HANG EXECUTION, as there will be no way to provide CLI input (STDIN) on the GUI**
 * @packageDocumentation
 */
import { createInterface } from "readline";
import type Logger from "./logger";
import titleCase from "./titlecase";

/* eslint-disable @typescript-eslint/explicit-function-return-type */

/**
 * Wrap rl in a promise for us
 */
function getInputPromise(question = ""): Promise<string> {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout
	});
	return new Promise((resolve) => rl.question(question, input => {
		resolve(input);
		rl.close();
	}));
}


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
	[PromptTypes.error]: PromptFunctionType;
}

/**
 * The type ALL prompt provider funcs implement
 * @param message Message to prompt with
 * @param config Config for prompts, likely onl
 */
export type PromptFunctionType = (message: string, config?: any) => Promise<PromptResponse>;

/**
 * Base config type for the private basePrompt func
 * The specific config for the GUI is somewhere else.
 */
export interface BasePromptConfig {
	type: PromptTypes[];
	message: string;
	logger: (text: string) => void;
}

export interface PromptConfig {
	/** Button to use. defaults to yes or no (y/n) */
	buttons?: string[];
	/** Index of default button (option) in button array. */
	defaultButton?: number;
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


/**
 * Handles prompts for the logger, so that commands using a twokeys object can have interactivity with users aon both CLI and GUI.
 */
export default class Prompts implements PromptsInterfaces {
	/** Constants */
	/**
	 * Provides the options to use for a yes no question,
	 * should be overriden by GUI to Yes and No.
	 */
	public YES_NO = ["y", "n"];

	constructor(protected logger: Logger) {}

	/**
	 * On CLI, pauses execution so the user can read an important piece of info.
	 * TO not halt execution, please just use {@link Logger.info}
	 * @see BasePromptType
	 */
	public async info(message: string) {
		this.logger.info("");
		this.logger.info(message);
		//this.logger.info("");
		this.logger.info("Press enter to continue.");
		await getInputPromise("");
		return { response: 0 };
	}
	private async basePrompt(config: BasePromptConfig) {
		config.logger("");
		config.logger(config.message);
	}
	// @ts-ignore
	question(message: string) {

	}

	async warning(message: string, config: PromptConfig = {}) {
		this.logger.warn("");
		if (typeof config.buttons === "undefined") {
			config.buttons = this.YES_NO;
		}
		// Generate options
		const SEPARATOR = "/";
		// Normalise the buttons to lowercase so it's easier to look for it
		const normalisedOptions = config.buttons?.map(value => value.toLowerCase());
		const optionsArray = [...normalisedOptions]; // Copy for options
		// Use this to generate the options -> the default is made into titlecase
		if (typeof config.defaultButton !== "undefined") {
			optionsArray[config.defaultButton] = titleCase(optionsArray[config.defaultButton])
		}
		const options = optionsArray.join(SEPARATOR);

		this.logger.warn(`${message} [${options}]`);
		
		// Get response index
		const responseLiteral = await getInputPromise();
		const responseIndex = normalisedOptions.indexOf(responseLiteral.toLowerCase());
		if (responseIndex < 0) {
			this.logger.warn("Invalid response.");
			return this.warning(message, config);
		}
		return { response: responseIndex };
	}

	// @ts-ignore
	error(message: string) {

	}
}