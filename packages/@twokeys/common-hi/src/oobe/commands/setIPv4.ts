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

import { BaseTwoKeysForCommands } from "../../common";

export interface SetStaticIPv4 {
	networkAdapter: string;
	ipv4: string;
}

/**
 * Sets a static IPv4 address for the server
 * @param twokeys TwoKeys object to use for logging
 * @param config Config
 */
export default async function setStaticIPv4Address(twokeys: BaseTwoKeysForCommands, config: SetStaticIPv4): Promise<void> {
	twokeys.logger.substatus("Setting an ipv4 address...")
	twokeys.logger.info(`Address: ${config.ipv4}`);
	twokeys.logger.warn("NOT YET IMPLEMENTED!");
}