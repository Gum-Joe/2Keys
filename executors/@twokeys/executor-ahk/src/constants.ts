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

import { Software, SOFTWARE_DOWNLOAD_TYPE_ZIP } from "@twokeys/addons";

/**
 * Constants
 * @packageDocumentation
 */
export const AUTO_HOTKEY_H = "AutoHotkey_H";
export const AHK_DLL_X64 = "AHK_DLL_x64";
export const AHK_DLL_X32 = "AHK_DLL_x32";

/**
 * Autohotkey_H software defintion that we ask 2Keys to install for us
 */
export const AHK_SOFTWARE_DEF: Software = {
	name: AUTO_HOTKEY_H,
	url: "https://codeload.github.com/HotKeyIt/ahkdll-v2-release/zip/master",
	homepage: "https://autohotkey.org",
	downloadType: SOFTWARE_DOWNLOAD_TYPE_ZIP,
	executables: [
		{
			name: AHK_DLL_X64,
			path: "ahkdll-v2-release-master/x64w/AutoHotkey.dll",
			arch: "x64",
		},
		{
			name: AHK_DLL_X32,
			path: "ahkdll-v2-release-master/Win32w/AutoHotkey.dll",
			arch: "x32",
		}
	]
};