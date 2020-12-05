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
 * Contains the 2Keys base class that is provided to {@link TaskFunction}s & {@link StatefulTaskRunner}.
 */
import Logger from "./logger";

/**
 * Propreties related to exection of an add-on
 * NOTE: treat all these as optional, i.e. use {@link TwoKeysProperties} from below
 */
export interface AllTwoKeysProperties {
	/**
	 * Root of the project the TwoKeys object is being used for
	 * Use {@link assertIsForProject} to validate it is there, and thus stop TS complaning it is undefined
	 */
	projectDir: string;
}

/**
 * Make all proerties optional as they may not have been set.
 * 
 * Use type assertions to ensure the properties are there (and then TS won't complain the property is undefined)
 */
export type TwoKeysProperties = Partial<AllTwoKeysProperties>;

/**
 * Type to use to say that a function wants a twokeys with {@link AllTwoKeysProperties} -> i.e. all properties present
 */
export type TwoKeysWithAllProperties = TwoKeys & { properties: AllTwoKeysProperties };

/**
 * Base TwoKeys class, used for commands, logic and add-ons.
 * This is an abstract class as we don't know what to call the logger.
 * 
 * The TwoKeys class provides essential methods for commands and add-ons.
 * This base class provides a logger, and should be extended to add additonal functions, e.g. software registery access.
 * It also provides properties for what is being ran, namely properties
 * @param logger Constrcutor for the logger to use
 * @param logName Name to use as log prefix, see {@link Logger.args.name}
 */
export abstract class TwoKeys {
	public readonly logger: Logger;
	constructor(public readonly LoggerConstructor: typeof Logger, logName: string, public readonly properties: TwoKeysProperties) {
		this.logger = new this.LoggerConstructor({
			name: logName,
		});
	}
}
