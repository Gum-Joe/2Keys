/**
Copyright 2018 Kishan Sambhi

This file is part of 2Keys.

2Keys is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

2Keys is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
*/
/**
 * @overview Root for software downloader stuff
 */
import { Arguments } from "yargs";
import ZipDownloader from "./zip-downloader";
import { AHK_DOWNLOAD_PATH, DEFAULT_USERSPACE_SOFTWARE_DOWNLOAD, AHK_VERSION, DEFAULT_USERSPACE_SOFTWARE_PATHS } from "../../util/constants";
import { join } from "path";
import copy_contents from "../../util/copy-contents";
import Logger from "../../util/logger";


const logger = new Logger({
  name: "software"
});

/**
 * Downloader
 * @param argv Args from CLI
 */
export default async function fetch_software(argv: Arguments) {
  return new Promise(async (resolve, reject) => {
    try {
      const ahk = new ZipDownloader("ahk", AHK_DOWNLOAD_PATH, join(DEFAULT_USERSPACE_SOFTWARE_DOWNLOAD, `ahk-${AHK_VERSION}`), argv);
      await ahk.fetch_file(`ahk-${AHK_VERSION}`);
      await ahk.extract();
      await copy_contents(join(ahk.saveTo, `ahkdll-v${AHK_VERSION.split(".")[0]}-release-master`), join(DEFAULT_USERSPACE_SOFTWARE_PATHS.ahk.root));
      resolve();
    } catch (err) {
      logger.throw(err);
    }
  })
}