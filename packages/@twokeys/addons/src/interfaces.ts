/**
 * Interfaces
 */

/** Add-on type, i.e. tells us what type it is */
export type TWOKEYS_ADDON_TYPES = "executor" | "detector"; // | "pack" | "library" | "extension";

/**
 * Represents information stored under key `twokeys` in an add-ons `package.json`
 */
export interface TwokeysPackageInfo {
	types: TWOKEYS_ADDON_TYPES[];
	/** Entry point file of package with requireed exports for a given add-on type (for types see {@link TWOKEYS_ADDON_TYPE}) */
	entry: Map<TWOKEYS_ADDON_TYPES, string>;
	/** Optional displayname of package in package browser */
	displayName?: string;
}

/**
 * Represents a package (add-on) in the database (add-on registry).
 * (single DB document)
 */
export interface PackageInDB {
	id: number;
	name: string;
	types: TWOKEYS_ADDON_TYPES[];
	/** Information about the package, which is found in package.json */
	info: {
		version: string;
		description: string;
		/** Size of package */
		size: number;
		/** Location (URL, so file:// for local files) of icon */
		iconURL: string;
		/** Display name of package in GUI/CLI */
		displayName?: string;
	};
	/** Entry point file of package with requireed exports for a given add-on type (for types see {@link TWOKEYS_ADDON_TYPE}) */
	entry: Map<TWOKEYS_ADDON_TYPES, string>;
}
