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
 * Development tools for add-ons to use,
 * Includes tools for testing, as well as helpers
 * @packageDocumentation
 */
import assert from "assert";
import { TwokeysPackageInfo, TWOKEYS_ADDON_TYPES_ARRAY } from "./util/interfaces";
import TwoKeys, { TwoKeysForAProject, TwoKeysPropertiesForAddons } from "./module-interfaces/twokeys";
import AddOnsRegistry from "./registry";
import { Logger } from "@twokeys/core";

/**
 * Hack to typecast the types key to any so we can do what we want with it.
 * DO NOT USE DIRECTLY.
 */
interface BaseUnknownTwoKeysPackageInfo extends TwokeysPackageInfo {
	types: any[];
}

/**
 * Set the types key to a string array so that any package.json can be used.
 * Use with {@link BaseUnknownTwoKeysPackageInfo}
 */
export interface UnknownTwoKeysPackageInfo extends BaseUnknownTwoKeysPackageInfo {
	types: string[];
}


export interface AddOnsPackageJSON {
	[key: string]: any;
	twokeys: UnknownTwoKeysPackageInfo;
}

/**
 * Asserts that the twokeys key in a packageJSON is correct, i.e. has the right types.
 * @throws AssertionError if one of `(package.json).twokeys.types` is not in {@link TWOKEYS_ADDON_TYPES_ARRAY}
 * @param packageJSON package.json to validate
 */
function assertTwoKeysKeyIsCorrect(packageJSON: { [key: string]: any; twokeys: UnknownTwoKeysPackageInfo }): asserts packageJSON is { [key: string]: any; twokeys: TwokeysPackageInfo } {
	packageJSON.twokeys.types.forEach(addOnType => assert(TWOKEYS_ADDON_TYPES_ARRAY.includes(addOnType), `Add-on type ${addOnType} is invalid!`));
}

/**
 * Creates a mock TwoKeys object for testing purposes
 * @param packageJSON Package.json of the add-on
 * @param registryLocation Mock registry location, including filename
 * @param properties Properties for {@link TwoKeys.properties}
 */
export function createMockTwoKeys(packageJSON: AddOnsPackageJSON, registryLocation: string, properties: TwoKeysPropertiesForAddons = {}): TwoKeys {
	assertTwoKeysKeyIsCorrect(packageJSON);
	return new TwoKeys(AddOnsRegistry.convertPackageJSONToDBDocument(packageJSON), registryLocation, AddOnsRegistry.getLoggerForAddon(AddOnsRegistry.convertPackageJSONToDBDocument(packageJSON), Logger), properties);
}

/**
 * Asserts that TwoKeys.properties has projectDir, so you don't have to
 * Will throw AssertionError: please use try catch to handle it yourself (and throw an error due to it if you want)
 */
export function assertIsForProject(twokeys: TwoKeys): asserts twokeys is TwoKeysForAProject {
	// assert(typeof twokeys.properties !== "undefined", "No `properties` key present on twokeys! The function may not been called for a project");
	assert(
		typeof twokeys.properties !== "undefined"
		&& typeof twokeys.properties.projectDir !== "undefined",
		"twokeys.properties.projectDir not present! The function has not been called for a project."
	);
}