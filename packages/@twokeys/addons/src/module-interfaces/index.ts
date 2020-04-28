/**
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
 * @license
 */
/**
 * Root file that exports all the interfaces that define what different types of add-on should export.
 * Add-on types are defined in {@link TWOKEYS_ADDON_TYPES}.
 * @packageDocumentation
 */

import { Executor } from "./executor";
import { DetectorController } from "./detector";
import { TWOKEYS_ADDON_TYPE_DETECTOR, TWOKEYS_ADDON_TYPE_EXECUTOR, TWOKEYS_ADDON_TYPES } from "../interfaces";

// TODO: Add types for TaskFunction<T, G>
export * from "./common";
export * from "./detector";
export * from "./executor";

/** Collection of AddOnModules, used to easily reference an addon module defintion based on a string of its type */
export type AddOnModulesCollection = {
	[key in TWOKEYS_ADDON_TYPES]:
		key extends TWOKEYS_ADDON_TYPE_DETECTOR ? DetectorController :
		key extends TWOKEYS_ADDON_TYPE_EXECUTOR ? Executor :
		any;
};
