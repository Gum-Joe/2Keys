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
 * Main detector type entry point
 * @packageDocumentation
 */
import type { DetectorController } from "@twokeys/addons";
import generateConfig from "./setup/client/generateConfig";
import newClient from "./setup/client/newClient";
import install from "./install";

const detector: DetectorController = {
	setup: {
		// @ts-expect-error
		setupNewClient: {
			generateConfig,
			setup: newClient,
		}
	},
	install,
};

export = detector;