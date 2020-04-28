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
 * Interfaces
 * @packageDocumentation
 */
export const TWOKEYS_ADDON_TYPE_EXECUTOR = "executor";
export const TWOKEYS_ADDON_TYPE_DETECTOR = "detector";
export const TWOKEYS_ADDON_TYPE_PACK = "pack";
export const TWOKEYS_ADDON_TYPE_LIBRARY = "library";
export const TWOKEYS_ADDON_TYPE_EXTENSION = "extension";
export type TWOKEYS_ADDON_TYPE_EXECUTOR = "executor";
export type TWOKEYS_ADDON_TYPE_DETECTOR = "detector";
export type TWOKEYS_ADDON_TYPE_PACK = "pack";
export type TWOKEYS_ADDON_TYPE_LIBRARY = "library";
export type TWOKEYS_ADDON_TYPE_EXTENSION = "extension";
/**
 * Defines possible add-on types, i.e. teels us what the add-ons does:
 * - Executor: These add-ons handle execution of macros, and are called by the server when a hotkey is detected
 * - Detector: Specifically this is a detector controller (see {@link DetectorController} for detector controllers vs detectors vs clients).
 * 	This controlls the interaction between the server and detectors.
 * - Pack: A pack of macros, essentially a downloaded series of pre written macros (that will also be configurable)
 * 	that can be assigned to be executed when a hotkey is detected. **There are no plans to implement this just yet.**
 * - Library: A library of functions that can be used by users to write macros for a given executor. **There are no plans to implement this just yet.**
 * - Extension: Extends the functionality of 2Keys, adding e.g. RGB. **There are no plans to implement this just yet.**
 */
export type TWOKEYS_ADDON_TYPES = TWOKEYS_ADDON_TYPE_EXECUTOR | TWOKEYS_ADDON_TYPE_DETECTOR | TWOKEYS_ADDON_TYPE_PACK | TWOKEYS_ADDON_TYPE_LIBRARY | TWOKEYS_ADDON_TYPE_EXTENSION;
/** See {@link TWOKEYS_ADDON_TYPES} */
export const TWOKEYS_ADDON_TYPES_ARRAY = [TWOKEYS_ADDON_TYPE_EXECUTOR, TWOKEYS_ADDON_TYPE_DETECTOR, TWOKEYS_ADDON_TYPE_PACK, TWOKEYS_ADDON_TYPE_LIBRARY, TWOKEYS_ADDON_TYPE_EXTENSION];
/**
 * Represents information stored under key `twokeys` in an add-ons `package.json`
 */
export interface TwokeysPackageInfo {
	types: TWOKEYS_ADDON_TYPES[];
	/** Entry point file of package with requireed exports for a given add-on type (for types see {@link TWOKEYS_ADDON_TYPE}) */
	entry: { [key in TWOKEYS_ADDON_TYPES]: string };
	/** Optional displayname of package in package browser */
	displayName?: string;
	/** Location (URL, so file:// for local files) of icon */
	iconURL?: string;
}

/**
 * Represents a package (add-on) in the database (add-on registry) that has been parsed and converted
 * (single DB document)
 */
export interface Package {
	id?: string; // Given by it
	name: string;
	types: TWOKEYS_ADDON_TYPES[];
	/** Information about the package, which is found in package.json */
	info: {
		version: string;
		description: string;
		/** Size of package */
		size: number | null;
		/** Location (URL, so file:// for local files) of icon */
		iconURL?: string;
		/** Display name of package in GUI/CLI */
		displayName?: string;
	};
	/** Entry point file of package with requireed exports for a given add-on type (for types see {@link TWOKEYS_ADDON_TYPE}) */
	entry: { [key in TWOKEYS_ADDON_TYPES]: string };
}

/**
 * Represents an unparsed package in the DB
 */
export interface PackageInDB {
	id: string;
	name: string;
	types: string; // JSON
	info: string; // JSON
	entry: string; // JSON
}

/**
 * Return type for validators
 */
export interface ValidatorReturn { status: boolean; message?: string; }
