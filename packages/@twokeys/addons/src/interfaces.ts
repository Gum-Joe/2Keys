/**
 * Interfaces
 */

/** Add-on type, i.e. tells us what type it is */
export type TWOKEYS_ADDON_TYPE = "executor" | "detector" | "pack" | "library" | "extension";
/**
 * Represents information stored under key `twokeys` in an add-ons `package.json`
 */
export interface TwokeysPackageInfo {
	types: TWOKEYS_ADDON_TYPE[];
}

/**
 * Represents a package (add-on) in the database (add-on registry)
 */
export interface PackageInDB {
	name: string;
	version: string;
	types: TWOKEYS_ADDON_TYPE[];
	/** Entry point file of package with requireed exports for a given tadd-on type (for types see {@link TWOKEYS_ADDON_TYPE}) */
	entry: Map<TWOKEYS_ADDON_TYPE, string>;
}
