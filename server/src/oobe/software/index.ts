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