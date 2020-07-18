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
 * Root for software downloader stuff
 * @packageDocumentation
 */
import { Arguments } from "yargs";
import ZipDownloader from "@twokeys/addons/lib/util/zip-downloader";
import { AHK_DOWNLOAD_PATH, DEFAULT_USERSPACE_SOFTWARE_DOWNLOAD, AHK_VERSION, DEFAULT_USERSPACE_SOFTWARE_PATHS } from "../../util/constants";
import { join } from "path";
import copy_contents from "../../util/copy-contents";
import Logger from "../../util/logger";
import { Software, SOFTWARE_DOWNLOAD_TYPE_ZIP } from "@twokeys/addons/lib/util/interfaces";


const logger = new Logger({
	name: "software"
});

/**
 * Downloader
 * @param argv Args from CLI
 */
export default async function fetch_software(argv: Arguments) {
	try {
		const soft: Software = {
			name: "ahk",
			url: AHK_DOWNLOAD_PATH,
			downloadType: SOFTWARE_DOWNLOAD_TYPE_ZIP,
			executables: [],
			homepage: "",
		}
		const savePath = join(DEFAULT_USERSPACE_SOFTWARE_DOWNLOAD, `ahk-${AHK_VERSION}`);
		const ahk = new ZipDownloader(soft, savePath + ".zip", savePath, {
			noForce: argv.force ? false : true
		});
		await ahk.download();
		await ahk.extract();
		await copy_contents(join(savePath, `ahkdll-v${AHK_VERSION.split(".")[0]}-release-master`), join(DEFAULT_USERSPACE_SOFTWARE_PATHS.ahk.root));
	} catch (err) {
		logger.throw(err);
	}
}