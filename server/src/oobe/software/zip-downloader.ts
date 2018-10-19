/**
 * @overview ZIP file downloader, extracter and copier
 */
import { open as openRaw } from "fs";
import * as mkdirp from "mkdirp";
import Logger from "../../util/logger";
import { promisify } from "util";

const open = promisify(openRaw);

export default class ZipDownloader {
  private logger: Logger;
  private url: string;

  public name: string;
  public saveTo: string;

  /**
   * Constructor
   * @param name Name of software downloading, as referenced in userspace_config.software
   * @param url URL to download the zip from
   * @param saveTo Dir to save file to
   */
  constructor(name: string, url: string, saveTo: string) {
    this.name = name;
    this.logger = new Logger({
      name,
    });
    this.url = url;
    this.saveTo = saveTo;
  }

  /**
   * Download the file
   */
  async fetch_file() {
    this.logger.info(`Downloading package from url ${this.url} to ${this.saveTo}...`);
    this.logger.debug("Creating dirs...");
    mkdirp(this.saveTo);
    this.logger.debug("Opening file...");
    try {
      const fd = await open(this.saveTo, "wx");
    } catch (err) {
      if (err.code === "EEXIST") {
        this.logger.err(`${this.name} already downloaded.  Please delete the downloaded file if you need to redownload it.`);
      } else {
        this.logger.err(`Error opening file to save ${name} to!`);
        this.logger.throw(err);
      }
    } finally {
      // File open for writeing
      
    }

  }
}