/**
 * Development tools for add-ons to use
 */
import assert from "assert";
import { TwokeysPackageInfo, TWOKEYS_ADDON_TYPES_ARRAY } from "./util/interfaces";
import TwoKeys from "./module-interfaces/twokeys";
import AddOnsRegistry from "./registry";

/**
 * Set the types key to a string array so that any package.json can be used
 */
// @ts-expect-error: Forceably override types key
interface UnknownTwoKeysPackageInfo extends TwokeysPackageInfo {
	types: string[];
}


interface AddOnsPackageJSON {
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
 * @param registryLocation Mock registry location
 */
export function createMockTwoKeys(packageJSON: AddOnsPackageJSON, registryLocation: string): TwoKeys {
	assertTwoKeysKeyIsCorrect(packageJSON);
	return new TwoKeys(AddOnsRegistry.convertPackageJSONToDBDocument(packageJSON), registryLocation);
}