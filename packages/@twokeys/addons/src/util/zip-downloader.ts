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
 * Contains the class to download software
 * @packageDocumentation
 */
import { promises as fs, constants as fsconstants } from "fs";
import unzip from "extract-zip";
import Downloader, { DownloaderOptions } from "./downloader";
import { Software } from "./interfaces";
import type { Entry, ZipFile } from "yauzl";

const { access } = fs;


export default class ZipDownloader extends Downloader {

	/** Path to extract zip file to */
	protected extractToPath: string;
	downloaderName = "zip-downloader";

	/**
	 * Constructor
	 * @param software software object to download from {@link Software.url}. Please note URLs are HTTPS only
	 * @param savePath Path, including filename, to save to
	 * @param extractToPath Path to extract zip file to.
	 */
	constructor(software: Software, savePath: string, extractToPath: string, options: DownloaderOptions = {}) {
		super(software, savePath, options);
		this.extractToPath = extractToPath;
	}
	/**
	 * Extract the zip folder to `this.extractToPath`
	 */
	public async extract(): Promise<void> {
		this.logger.info("Extracting...");
		// Validate existence of zip
		await access(this.savePath, fsconstants.F_OK);
		//const tmpPath = join(this.extractToPath);
		this.logger.debug(`Zip file found. Extracting to ${this.extractToPath}...`);
		// DO IT
		let entriesExtracted = 0;
		let totalEntries = -1;
		let progressBar: ProgressBar;
		await unzip(this.savePath, {
			dir: this.extractToPath,
			onEntry: (entry: Entry, zipfile: ZipFile) => {
				if (!this.logger.isSilent) {
					if (totalEntries === -1) {
						totalEntries = zipfile.entryCount;
						progressBar = this.logger.createProgressBar(`:bar :percent :entryNo/${totalEntries} ETA: :etas`, {
							complete: "▓",
							incomplete: "░",
							width: 50,
							total: totalEntries,
						});
					}
					entriesExtracted++;
					progressBar.tick({
						entryNo: entriesExtracted,
						percent: `${Math.round(entriesExtracted / totalEntries * 100).toString()}%`
					});
				}
			}
		});
	}
}
