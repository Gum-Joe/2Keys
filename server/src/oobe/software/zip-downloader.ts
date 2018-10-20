/**
 * @overview ZIP file downloader, extracter and copier
 */
import { open as openRaw, createWriteStream, write as writer, close as closeFile, appendFile } from "fs";
import https from "https";
import mkdirpRaw from "mkdirp";
import ProgressBar from "progress";
import { Arguments } from "yargs";
import Logger from "../../util/logger";
import { promisify } from "util";
import { join } from "path";

const open = promisify(openRaw);
const mkdirp = promisify(mkdirpRaw);

export default class ZipDownloader {
  private logger: Logger;
  private fullPath: string | undefined; // thus.saveTo + fetch_file().saveName

  public argv: Arguments;
  public url: string;
  public name: string;
  public saveTo: string;

  /**
   * Constructor
   * @param name Name of software downloading, as referenced in userspace_config.software
   * @param url URL to download the zip from (ONLY accepts HTTPS)
   * @param saveTo Dir to save file to
   */
  constructor(name: string, url: string, saveTo: string, argv: Arguments) {
    this.name = name;
    this.logger = new Logger({
      name,
    });
    this.url = url;
    this.saveTo = saveTo;
    this.argv = argv;
  }

  /**
   * Download the file
   * @param saveLoc File name to save zip to.
   */
  async fetch_file(saveName: string | undefined = this.name + ".zip") {
    this.logger.info(`Downloading package from url ${this.url} to ${this.saveTo} as ${saveName}.zip...`);
    this.fullPath = join(this.saveTo, saveName) + ".zip"; // Save full path

    // Make dirs
    try { await mkdirp(this.saveTo) } catch (err) { 
      this.logger.err("Error making download dirs!");
      this.logger.throw_noexit(err);
      return;
    };
    this.logger.debug("Creating dirs.");

    // See if exists
    // Only needed if not forcing
    if (!this.argv.force) {
      let file_number: number;
      try {
        file_number = await open(this.fullPath, "wx");
      } catch (err) {
        if (err.code === "EEXIST") {
          this.logger.err(`${this.name} already downloaded.  Please delete the downloaded file if you need to redownload it.`);
        } else {
          this.logger.err(`Error opening file to save to!`);
          this.logger.throw(err);
        }
        return;
      }
    }

    // Create request
    const req = https.request({
      host: this.url.split("/")[2],
      port: 443,
      path: this.url.slice(`https://${this.url.split("/")[2]}`.length)
    });

    req.on("response", res => {
      const len = parseInt(res.headers["content-length"], 10);
      let downloaded = "";

      const progress_bar = new ProgressBar(':bar :percent ETA: :etas', {
        complete: '▓',
        incomplete: '░',
        width: 50,
        total: isNaN(len) ? 6403580 : len
      });
      res.on('data', chunk => {
        progress_bar.tick(chunk.length);
        // Would prefer stream or open() file descripter
        appendFile(this.fullPath, chunk, err => {
          if (err) this.logger.throw_noexit(err);
        });
      });

      res.on('end', () => {
        this.logger.info("Download complete.");
      });
    });

    req.end();
  }

  /**
   * Extract the zip folder
   */
  async extract() {
    this.logger.info("Extracting...");
    if (typeof this.fullPath !== "undefined") {
      this.logger.err("Error! Zip file not fetched.");
    }
  }
}