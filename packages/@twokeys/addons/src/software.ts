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
 * Contains the software registry code
 * @packageDocumentation
 */
import { join, basename } from "path";
import { Database } from "sqlite";
import * as uuid from "uuid";
import Downloader from "./util/downloader";
import ZipDownloader from "./util/zip-downloader";
import { SOFTWARE_TABLE_NAME, EXECUTABLES_TABLE_NAME, SOFTWARE_ROOT_FOLDER } from "./util/constants";
import {
	Software,
	Executable,
	Package,
	TWOKEYS_ADDON_TYPES,
	SQLBool,
	SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD,
	SOFTWARE_DOWNLOAD_TYPE_STANDALONE,
	SOFTWARE_DOWNLOAD_TYPE_ZIP,
	SoftwareInDB
} from "./util/interfaces";
import SoftwareRegistryQueryProvider, { SoftwareRegistryDBProviderOptions } from "./software-query-provider";

// Interface to implement
interface SoftwareRegI {
	// Properties
	db?: Database;
	directory: string;

	// Methods
	/** Intialises the DB */
	initDB(): Promise<void>;
	/** Downloads and installs a piece of software. */
	installSoftware(software: Software): Promise<void>;
	/** Runs install on a piece of software where {@link Software.runInstall} was false */
	runInstall(software: Software): Promise<void>;
	/** Uninstall a piece of software */
	uninstallSoftware(name: string): Promise<void>;
	/** Update records for a piece of software */
	updateSoftwareRecord(name: string, newData: Software): Promise<void>;
	/** Get full path to an executable */
	getExecutablePath(software: string, name: string): Promise<string>;
	/** Get executable object */
	getExecutable(software: string, name: string): Promise<Executable>;
	/** Get software object */
	getSoftware(name: string): Promise<SoftwareInDB>;
	/** Converts software in DB to a {@link Software} */
	// parseSoftwareFromDB(softwareFromDB: any): Software;
}

/** Options for a new Software registry */
interface SoftwareRegistryOptions<PackageType extends TWOKEYS_ADDON_TYPES> extends SoftwareRegistryDBProviderOptions {
	/** Package object for software registry */
	package: Package<PackageType>;
}
/**
 * Software registry class.
 * This is a registry of software that is installed for a **specific** add-on.
 * It is stored as a table in the registry DB ({@link SOFTWARE_TABLE_NAME}).
 * It is noted all software is stored in one table and the ownerName field used to limit software to only that used by an add-on.
 */
export default class SoftwareRegistry<PackageType extends TWOKEYS_ADDON_TYPES> extends SoftwareRegistryQueryProvider implements SoftwareRegI {
	/** Package Object representing the add-on the software reg is for */
	public readonly package: Package<PackageType>;

	constructor(options: SoftwareRegistryOptions<PackageType>) {
		super(options);
		this.package = options.package;
		this.logger.args.name = this.package.name;
	}

	/**
	 * Adds a piece of software to the DB, along with its executables.
	 * Then run {@link SoftwareRegistry.runInstall}
	 * 
	 * Note: Don't try to install pieces of software with the same names, it will throw an error (see {@link SoftwareRegistryQueryProvider.getSoftwares})
	 */
	public async installSoftware(software: Software): Promise<void> {
		this.logger.info(`Installing software ${software.name}...`);
		if (!this.db || typeof this.db === "undefined") {
			await this.initDB();
		}
		this.logger.info("Adding software to registry...");
		// Validate if software of this name already in DB
		this.logger.debug("Checking if already installed...");
		const results = await super.getSoftwares(software.name);
		if (results.length > 0) {
			this.logger.err("Error! Attempted to install a piece of software with a name already used!");
			this.logger.err(`This is a problem with the add-on ${this.package.name}.`);
			this.logger.err("Please file an issue with them.");
			throw new Error("Error! Attempted to install a piece of software with a name already used!");
		}
		// Ok, add it to the DB
		const softwareUUID = uuid.v4();
		const stmt = await this.db.prepare(
			`INSERT INTO ${SOFTWARE_TABLE_NAME} (id, name, url, homepage, ownerName, installed, downloadType) VALUES (@id, @name, @url, @homepage, @ownerName, @installed, @downloadType)`,
		);
		await stmt.all({
			"@name": software.name,
			"@id": softwareUUID,
			"@url": software.url,
			"@homepage": software.homepage,
			"@ownerName": this.package.name,
			"@installed": SQLBool.False, // NOTE: Use 0 for false and 1 for true
			"@downloadType": software.downloadType,
		});
		this.logger.info("Adding executables to registry...");
		for (const executable of software.executables) {
			const executablesStmt = await this.db.prepare(
				`INSERT INTO ${EXECUTABLES_TABLE_NAME} (id, name, path, arch, os, userInstalled, softwareId) VALUES (@id, @name, @path, @arch, @os, @userInstalled, @softwareId)`,
			);
			await executablesStmt.all({
				"@name": executable.name,
				"@id": uuid.v4(),
				"@path": Object.prototype.hasOwnProperty.call(executable, "userInstalled") && executable.userInstalled ? executable.path : join(this.getOneSoftwareFolder(software.name), executable.path),
				"@arch": executable.arch,
				"@os": executable.os || process.platform,
				"@userInstalled": Object.prototype.hasOwnProperty.call(executable, "userInstalled") && executable.userInstalled ? SQLBool.True : SQLBool.False,
				"@softwareId": softwareUUID,
			});
		}
		this.logger.debug("Now running install function...");
		return await this.runInstall(software);
	}
	/**
	 * Downloads and installs a piece of software.
	 * Please Note:
	 * - Software of type {@link SOFTWARE_DOWNLOAD_TYPE_ZIP} will be directly extract to the folder where the zip is saved.
	 * - Software of type {@link SOFTWARE_DOWNLOAD_TYPE_STANDALONE} will cause software to be downloaded to a file that is saved as the last part of the url, if {@link Software.filename} is not given
	 * @param software Software object to install
	 */
	public async runInstall(software: Software): Promise<void> {
		this.logger.info(`Downloading and installing software of ${software.name}....`);
		if (software.noAutoInstall || software.downloadType === SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD) {
			this.logger.warn(`Software ${software.name} not downloaded and installed as noAutoInstall was set, or download type was ${SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD}!`);
			this.logger.warn("This could mean an add-on requires you to install software yourself!");
			this.logger.warn(`Add-on: ${this.package.name}`);
			this.logger.debug(`noAutoInstall: ${software.noAutoInstall}`);
			this.logger.debug(`downloadType: ${software.downloadType}`);
			return;
		}
		// After this point it's safe to assume the software can be installed
		// Begin
		// Create the save path
		const savePathDir = this.getOneSoftwareFolder(software.name);
		this.logger.debug(`Type: ${software.downloadType}`);
		this.logger.debug(`Save dir: ${savePathDir}`);
		switch (software.downloadType) {
			case SOFTWARE_DOWNLOAD_TYPE_STANDALONE: {
				const downloader = new Downloader(software, join(savePathDir, software.filename || basename(software.url)), { logger: this.logger });
				await downloader.download();
				break;
			}
			case SOFTWARE_DOWNLOAD_TYPE_ZIP: {
				const downloader = new ZipDownloader(software, join(savePathDir, software.filename || "tmp.zip"), savePathDir, { logger: this.logger });
				await downloader.download();
				await downloader.extract();
				break;
			}
		}
		this.logger.info("Software downloaded.");
		this.logger.debug("Saving install state to DB...");
		await this.db.run(`UPDATE ${SOFTWARE_TABLE_NAME} SET installed = ${SQLBool.True} WHERE name = ?`, software.name);
		return;
	}
	uninstallSoftware(name: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	updateSoftwareRecord(name: string, newData: Software): Promise<void> {
		throw new Error("Method not implemented.");
	}

	// Query wrappers
	getExecutablePath(software: string, name: string): Promise<string> {
		throw new Error("Method not implemented.");
	}
	getExecutable(software: string, name: string): Promise<Executable> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Retrieves a **SINGLE** piece of software from the DB.
	 * Please look at {@link SoftwareRegistryQueryProvider.getSoftwares} for more info, such as constraints.
	 * @param name Name of software to get.
	 */
	public async getSoftware(name): Promise<SoftwareInDB> {
		const results: SoftwareInDB[] = await super.getSoftwares(name, this.package.name);
		if (results.length > 1) {
			this.logger.err("ERROR! More than one software found!");
			this.logger.err("This situation is supposedly impossible, as you can't have software be the same name and also belong to the same add-on.");
			this.logger.err("This could mean the add-on writer did something wrong, or there is an issue in 2Keys.");
			this.logger.err("It's recomended you reinstall the offending add-on.");
			this.logger.err("Still getting an error? Please file an issue with 2Keys.");
			throw new Error("ERROR! More than one software found (which should be impossible)!");
		}
		return results[0];
	}
	/**
	 * Prevent use of getSoftwares.
	 * 
	 * This placeholder exists as add-on should not be using getSoftwares()
	 */
	public async getSoftwares(name: string): Promise<SoftwareInDB[]> {
		this.logger.warn("Don't use getSoftwares(): use getSoftware() instead");
		return [await this.getSoftware(name)];
	}

	/**
	 * Gets software folder root
	 */
	public getSoftwareFolderRoot(): string {
		return join(this.directory, SOFTWARE_ROOT_FOLDER, this.package.name);
	}

	/**
	 * Gets folder for a given piece of software
	 */
	public getOneSoftwareFolder(softwareName: string): string {
		return join(this.getSoftwareFolderRoot(), softwareName);
	}


} 