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
 * Contains the 2Keys class that is provided to {@link TaskFunction}s
 */
import path from "path";
import { Logger, TwoKeys as BaseTwoKeys } from "@twokeys/core";
import { Package, TWOKEYS_ADDON_TYPES } from "../util/interfaces";
import SoftwareRegistry from "../software";

/** Interface twokeys must implement */
interface TwoKeysI<AddOnsType extends TWOKEYS_ADDON_TYPES> {
	logger: Logger;
	package: Package<AddOnsType>;
	software: SoftwareRegistry<AddOnsType>;
}

/**
 * Propreties related to exection of an add-on
 * NOTE: treat all these as optional
 */
export interface AllTwoKeysProperties {
	/**
	 * Root of the project the add-on is being run for.
	 * Use {@link assertIsForProject} to validate it is there, and thus stop TS complaning it is undefined
	 */
	projectDir: string;
}

/**
 * Make all proerties optional as they may not have been set.
 * 
 * Use the assertion tools in {@link dev-tools} to ensure the properties are there (and then TS won't complain the property is undefined)
 */
export type TwoKeysProperties = Partial<AllTwoKeysProperties>;

/**
 * Type to use to say that a function wants a twokeys with {@link AllTwoKeysProperties} -> i.e. all properties present
 */
export type TwoKeysForAProject<AddOnsType extends TWOKEYS_ADDON_TYPES = TWOKEYS_ADDON_TYPES> = TwoKeys<AddOnsType> & { properties: AllTwoKeysProperties };

/**
 * Class provided to add-on function that allows them to interact with 2Keys
 */
export default class TwoKeys<AddOnsType extends TWOKEYS_ADDON_TYPES = TWOKEYS_ADDON_TYPES> extends BaseTwoKeys implements TwoKeysI<AddOnsType> {
	public readonly package: Package<AddOnsType>;
	public readonly software: SoftwareRegistry<AddOnsType>;

	/**
	 * Class provided to add-on function that allows them to interact with 2Keys
	 * @param packageObject Object containing info on add-on
	 * @param registryDB Path to add-ons registry DB, where software table is stored (see {@link SoftwareRegistry})
	 * @param properties Properties related to execution - **please see {@link TwoKeysProperties}**
	 */
	constructor(packageObject: Package<AddOnsType>, registryDB: string, CustomLogger: typeof Logger = Logger, public readonly properties?: TwoKeysProperties) {
		super(CustomLogger, ":");
		this.package = packageObject;
		this.software = new SoftwareRegistry<AddOnsType>({
			package: packageObject,
			directory: path.dirname(registryDB),
			dbFileName: path.basename(registryDB),
			Logger: CustomLogger,
		});
	}
	
}

/**
 * T
 */