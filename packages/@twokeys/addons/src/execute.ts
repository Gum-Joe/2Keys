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
 * Holds the function that executes {@link TaskFunction}s
 * @packageDocumentation
 */

import { Package } from "./interfaces";
import { TaskFunction } from "../lib/module-interfaces";
import TwoKeys from "./module-interfaces/twokeys";

export default async function executeAddOnTask<GenericConfigT = any, ReturnG = any>
(packageObject: Package, func: TaskFunction<GenericConfigT, ReturnG>, config: GenericConfigT, TwoKeysClass: typeof TwoKeys = TwoKeys): Promise<ReturnG> {
	const twoKeysObject = new TwoKeysClass(packageObject);
	return await func(twoKeysObject, config);
}