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
import { Logger } from "@twokeys/core";
import { Package, TWOKEYS_ADDON_TYPES } from "../interfaces";
import SoftwareRegistry from "../software";

/** Interface twokeys must implement */
interface TwoKeysI<AddOnsType extends TWOKEYS_ADDON_TYPES> {
	logger: Logger;
	package: Package<AddOnsType>;
	software: SoftwareRegistry<AddOnsType>;
}

/**
 * Class provided to add-on function that allows them to access 
 */
export default class TwoKeys<AddOnsType extends TWOKEYS_ADDON_TYPES> implements TwoKeysI<AddOnsType> {
	public logger: Logger;
	public package: Package<AddOnsType>;
	public software: SoftwareRegistry<AddOnsType>;

	/**
	 * 
	 * @param packageObject Object containing info on add-on
	 * @param registryDB Path to add-ons registry DB, where software table is stored (see {@link SoftwareRegistry})
	 */
	constructor(packageObject: Package<AddOnsType>, registryDB: string) {
		this.logger = new Logger({
			name: `add-on:${packageObject.name}`
		});
		this.package = packageObject;
		this.software = new SoftwareRegistry<AddOnsType>({
			package: packageObject,
			directory: path.dirname(registryDB),
			dbFileName: path.basename(registryDB)
		});
	}
	
}