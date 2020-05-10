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
/** A single string that represents on of the above add-on types */
export type TWOKEYS_ADDON_TYPE_SINGLE = TWOKEYS_ADDON_TYPES & string;
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
export interface Package<Types extends TWOKEYS_ADDON_TYPES = TWOKEYS_ADDON_TYPES> {
	id?: string; // Given by it
	name: string;
	types: Types[];
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
	entry: { [key in Types]: string };
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
export interface ValidatorReturn { status: boolean; message?: string }

// Interfaces for the software registry
// Processor architectures we support.
export const SOFTWARE_ARCH_X32 = "x32";
export const SOFTWARE_ARCH_X64 = "x64";
export const SOFTWARE_ARCH_ARM = "arm";
export const SOFTWARE_ARCH_ARM64 = "arm64";
export type SOFTWARE_ARCH_X32 = "x32";
export type SOFTWARE_ARCH_X64 = "x64";
export type SOFTWARE_ARCH_ARM = "arm";
export type SOFTWARE_ARCH_ARM64 = "arm64";
/**
 * Defines a single executable that's included in software
 */
export interface Executable {
	name: string;
	/**
	 * Path to this executable. This is:
	 * - Relative path inside the downloaded file to the executable when downloading it.  Use `./` for the downloaded file itself.
	 * - Absolute path to the executable when an object conforming to this interface is stored in the registry.
	 * - Name of an executable in path for preinstalled software
	 */
	path: string;
	/** Architecture of executable, 32 bit or 64 bit or arm or arm64 */
	arch: SOFTWARE_ARCH_X32 | SOFTWARE_ARCH_X64 | SOFTWARE_ARCH_ARM | SOFTWARE_ARCH_ARM64;
	/** OS.  Optional as it is assumed otherwise it is the current OS (`os.platform()`) */
	os?: NodeJS.Platform;
	/** Flag if user installed (i.e. 2Keys should treat it as if as it is on PATH). */
	userInstalled?: boolean;
}
/** Represents a single piece of installed software */
export interface Software {
	name: string;
	/**
	 * Download URL of software.
	 */
	url: string;
	/** Homepage */
	homepage: string;
	/** Map of executables (such as .exe and .dll files) included with the software to string */
	executables: Executable[];
	/**
	 * Installed flag. Can be set to false to signify software should not be installed, or is not installed at all (in the case of software on the PATH).
	 */
	autoInstall?: boolean;
}
