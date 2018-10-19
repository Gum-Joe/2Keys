/**
 * @overview Root for software downloader stuff
 */
import { Arguments } from "yargs";
import ZipDownloader from "./zip-downloader";
import { AHK_DOWNLOAD_PATH, DEFAULT_USERSPACE_SOFTWARE_DOWNLOAD, AHK_VERSION } from "../../util/constants";
import { join } from "path";

/**
 * Downloader
 * @param argv Args from CLI
 */
export default function fetch_software(argv: Arguments) {
  // fetch(ahk_url)
  // Extract
  // Copy
  const ahk = new ZipDownloader("ahk", AHK_DOWNLOAD_PATH, join(DEFAULT_USERSPACE_SOFTWARE_DOWNLOAD, `ahk-${AHK_VERSION}`));
  ahk.fetch_file();
}