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
 * Contains typedefs for ahk lib
 * @packageDocumentation
 */
const ahk = require("../build/Release/executor-ahk.node");

/**
 * What the AHK lib exports
 */
export interface AHKNativeModule {
	/**
	 * Runs a string of AHK text
	 * @param libraryPath Path to AHK DLL
	 * @param execString AHK code to execute
	 */
	run_ahk_text: (libraryPath: string, execString: string) => void;
}

export default ahk as AHKNativeModule;