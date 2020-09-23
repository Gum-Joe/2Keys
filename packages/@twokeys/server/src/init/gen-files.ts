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
 * Generates files, such as keyboard roots and index.ahks
 * @packageDocumentation
 */
import mkdirp from "mkdirp";
import { writeFileSync } from "fs";
import { join } from "path";
import { Config } from "../util/interfaces";
import { DEFAULT_AHK_ROOT_CONTENTS } from "../util/constants";
import Logger from "../util/logger";

const logger = new Logger({
	name: "generate"
});

/**
 * Generates files, such as keyboard root folder and index.ahks
 * @param config Config written to config.yml
 */
export default function gen_files(config: Config): Promise<void> {
	return new Promise((resolve, reject) => {
		// Get dirs & root
		const dirs: string[] = [];
		const roots: string[] = []; // index.ahks
		for (const keyboard in config.keyboards) {
			if (Object.prototype.hasOwnProperty.call(config.keyboards, keyboard)) {
				dirs.push(config.keyboards[keyboard].dir);
				roots.push(join(config.keyboards[keyboard].dir, config.keyboards[keyboard].root));
			}
		}

		// CREATE
		for (const dir of dirs) {
			try {
				mkdirp.sync(dir);
				logger.debug(`Made dir ${dir}.`);
			} catch (err) {
				return reject(err);
			}
		}

		for (const root of roots) {
			try {
				writeFileSync(root, DEFAULT_AHK_ROOT_CONTENTS);
				logger.debug(`Made root ${root}.`);
			} catch (err) {
				return reject(err);
			}
		}

		resolve();
	});
}