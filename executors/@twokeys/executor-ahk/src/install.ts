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
 * Runs the install function
 * @packageDocumentation
 */

import type { TaskFunction, TwoKeys, TWOKEYS_ADDON_TYPE_EXECUTOR } from "@twokeys/addons";
import { SOFTWARE_DOWNLOAD_TYPE_ZIP } from "@twokeys/addons";
import { AUTO_HOTKEY_H, AHK_DLL_X64, AHK_DLL_X32 } from "./constants";

const install: TaskFunction<any, void, TWOKEYS_ADDON_TYPE_EXECUTOR> = async (twokeys: TwoKeys<TWOKEYS_ADDON_TYPE_EXECUTOR>, config: any): Promise<void> => {
	twokeys.logger.info("Installing AutoHotkey_H v2 alpha, to execute macro scripts...");
	await twokeys.software.installSoftware({
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
	});
	twokeys.logger.info("AutoHotkey installed");
	return;
};

export default install;