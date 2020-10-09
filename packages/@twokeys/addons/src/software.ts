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
import { Database, Statement } from "sqlite";
import type { ISqlite } from "sqlite";
import * as uuid from "uuid";
import Downloader from "./util/downloader";
import ZipDownloader from "./util/zip-downloader";
import { SOFTWARE_TABLE_NAME, EXECUTABLES_TABLE_NAME } from "./util/constants";
import {
	Software,
	Executable,
	Package,
	TWOKEYS_ADDON_TYPES,
	SQLBool,
	SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD,
	SOFTWARE_DOWNLOAD_TYPE_STANDALONE,
	SOFTWARE_DOWNLOAD_TYPE_ZIP,
	SoftwareInDB,
	ExecutableInDB,
	PartialSoftware
} from "./util/interfaces";
import SoftwareRegistryQueryProvider, { SoftwareRegistryDBProviderOptions } from "./software-query-provider";
import rimrafCalledBack from "rimraf";
import { promisify } from "util";
import { CodedError } from "@twokeys/core";
import ContentCopier from "./util/copy-contents";

const rimraf = promisify(rimrafCalledBack);

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
	uninstallSoftware(name: string): Promise<ISqlite.RunResult>;
	/** Update records for a piece of software */
	updateSoftware(name: string, newData: Partial<Software>, reinstall: boolean): Promise<void>;
	/** Get executable object */
	getExecutable(software: string, name: string): Promise<Executable>;
	/** Get software object */
	getSoftware(name: string): Promise<SoftwareInDB | null>;
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
	}

	/**
	 * Adds a piece of software to the DB, along with its executables.
	 * Then run {@link SoftwareRegistry.runInstall}
	 * 
	 * Note: Don't try to install pieces of software (or register executables) with the same names, it will throw an error (see {@link SoftwareRegistryQueryProvider.getSoftwares}),
	 * if and only if the already registered software/execuatble belongs to the same add-on/software.
	 * 
	 * SQL constraints ensure no duplicates can exist.
	 */
	public async installSoftware(software: Software): Promise<void> {
		this.logger.info(`Installing software ${software.name}...`);
		await this.initDB();
		this.logger.info("Adding software to registry...");
		try {
			// Ok, add it to the DB
			const softwareUUID = uuid.v4();
			const stmt = await this.db.prepare(
				`INSERT INTO ${SOFTWARE_TABLE_NAME}
				(id, name, url, homepage, ownerName, installed, downloadType, noAutoInstall)
				VALUES (@id, @name, @url, @homepage, @ownerName, @installed, @downloadType, @noAutoInstall)`,
			);
			await stmt.all({
				"@name": software.name,
				"@id": softwareUUID,
				"@url": software.url,
				"@homepage": software.homepage,
				"@ownerName": this.package.name,
				"@installed": SQLBool.False, // NOTE: Use 0 for false and 1 for true
				"@downloadType": software.downloadType,
				"@noAutoInstall": software.noAutoInstall ? SQLBool.True : SQLBool.False,
			});
			this.logger.info("Adding executables to registry...");
			const executablesInsertors = software.executables.map(async (executable) => {
				this.logger.debug(`Adding executable ${executable.name}...`);
				const executablesStmt = await this.db.prepare(
					`INSERT INTO ${EXECUTABLES_TABLE_NAME}
					(id, name, path, arch, os, userInstalled, softwareId)
					VALUES (@id, @name, @path, @arch, @os, @userInstalled, @softwareId)`,
				);
				return executablesStmt.all({
					"@name": executable.name,
					"@id": uuid.v4(),
					"@path": Object.prototype.hasOwnProperty.call(executable, "userInstalled") && executable.userInstalled ?
						executable.path : join(this.getOneSoftwareFolder(software.name), executable.path),
					"@arch": executable.arch,
					"@os": executable.os || process.platform,
					"@userInstalled": Object.prototype.hasOwnProperty.call(executable, "userInstalled") && executable.userInstalled ?
						SQLBool.True : SQLBool.False,
					"@softwareId": softwareUUID,
				});
			});
			// DO THEM ALL
			await Promise.all(executablesInsertors);
			this.logger.debug("Now running install function...");
			return this.runInstall(software);
		} catch (err) {
			this.logger.err("ERROR! " + err.message);
			if (err.code === "SQLITE_CONSTRAINT") {
				// Dot needed so we see table name
				if (err.message.includes(SOFTWARE_TABLE_NAME + ".")) {
					this.logger.err("Error! Attempted to install a piece of software with a name already used!");
					this.logger.err(`This is a problem with the add-on ${this.package.name}.`);
					this.logger.err("Please file an issue with them.");
					throw new Error("Error! Attempted to install a piece of software with a name already used!");
				} else if (err.message.includes(EXECUTABLES_TABLE_NAME) + ".") {
					this.logger.err("Error! Attempted to register an executable with a name already used!");
					this.logger.err(`This is a problem with the add-on ${this.package.name}.`);
					this.logger.err("Please file an issue with them.");
					// Roll back changes
					this.logger.info("Rolling back changes by deleting software from DB...");
					await this.db.run(`DELETE FROM ${SOFTWARE_TABLE_NAME} WHERE name = ? AND ownerName = ?`, [software.name, this.package.name]);
					// Now throw
					throw new Error("Error! Attempted to register an executable with a name already used!");
				} else {
					// THis should be impossible, but just in case:
					throw err;
				}
			} else {
				throw err;
			}
		}
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
				const downloader = new Downloader(software, join(savePathDir, software.filename || basename(software.url)), { Logger: this.LoggerConstructor });
				await downloader.download();
				break;
			}
			case SOFTWARE_DOWNLOAD_TYPE_ZIP: {
				const downloader = new ZipDownloader(software, join(savePathDir, software.filename || "tmp.zip"), savePathDir, { Logger: this.LoggerConstructor });
				await downloader.download();
				await downloader.extract();
				break;
			}
		}
		this.logger.info("Software downloaded.");
		this.logger.debug("Saving install state to DB...");
		await this.db.run(`UPDATE ${SOFTWARE_TABLE_NAME} SET installed = ${SQLBool.True} WHERE name = ?`, software.name);
		this.logger.info("Done.");
		return;
	}

	/**
	 * PLEASE SEE {@link SoftwareRegistry.updateSoftwareRecord} FIRST, so you know the limitations & constraints
	 * 
	 * Please note you will most likely have to combine DB data with your edits,
	 * but you are still restricted by {@link SoftwareRegistry.updateSoftwareRecord}
	 * @see SoftwareRegistry.updateSoftwareRecord
	 * @param name Name of software to update
	 * @param newData Software object with only the properties to change in.
	 * 	It is Recomended you combine new props with those already in the DB.
	 * 	As name is a separate param, you can change the name in here.
	 * 	The software will be auto copied into a new folder under the new name if name !== newData.name
	 * @param updateRootPath Copies over the software to a folder under the name of the software
	 * 	(you don't need to pass this if you just want the software copied to a new folder if the name has been changed).
	 * 	Note: {@link Software.noAutoInstall} must be set to false to allow reinstalling
	 */
	public async updateSoftware(name: string, newData: PartialSoftware, reinstall = false): Promise<void> {
		this.logger.info(`Updating software of ${name}...`);
		// pass through
		// Since an empty newData is posssible, test for it here
		if (Object.keys(newData).length === 0 && newData.constructor === Object) {
			// EMPTY!
			this.logger.warn("Got an empty newData object, so no updates applied.");
		} else {
			await this.updateSoftwareRecord(name, newData as Partial<SoftwareInDB>);
		}
		const newSoftwareRecord = await this.getSoftware(newData.name || name);
		// Auto copy to new path if name changed
		if (typeof newData.name !== "undefined" && name !== newData.name) {
			const source = this.getOneSoftwareFolder(name);
			const dest = this.getOneSoftwareFolder(newData.name);
			this.logger.info(`Copying software from old folder of ${source} to ${dest}...`);
			const copier = new ContentCopier(source, dest, { Logger: this.LoggerConstructor });
			await copier.copyContents();
			// Now delete the old
			this.logger.info(`Deleting old folder (${source})...`);
			await rimraf(this.getOneSoftwareFolder(name));
		}
		// Reinstall
		if (reinstall) {
			if (newSoftwareRecord.noAutoInstall) {
				this.logger.warn("Not reinstalling as the noAutoInstall flag was set.");
			} else {
				this.logger.info(`Reinstalling software of ${newData.name || name}...`);
				this.logger.info("Deleting....");
				await rimraf(this.getOneSoftwareFolder(newData.name || name));
				// Get software back and run
				await this.runInstall((await this.getSoftware(newData.name || name)));
			}
		}
		this.logger.info("Done.");
		return;
	}
	/**
	 * Updates a software record in the DB.
	 * 
	 * Notes:
	 * - If providing a new executable, all props must be provided (as you would to {@link SoftwareRegistry.installSoftware}) - see {@link Executable}
	 * 	- for this, the path should also be relative to the software root - if a new name for the software is set, we handle using the right path ourselves.
	 * - If renaming or deleting an executable please see {@link SoftwareRegistry.renameExecutable} and {@link SoftwareRegistry.deleteExecutable} respectivly
	 * 	- This function does not automatically invoke these methods
	 * 
	 * Dev notes: schema of SQL needs to be kept in sync with {@link SoftwareRegistry.installSoftware}
	 * @param name Name of software to update
	 * @param newData Software object with only the properties to change in.
	 * 	It is Recomended you combine new props with those already in the DB.
	 * 	As name is a separate param, you can change the name in here.
	 * 	The software will be auto copied into a new folder under the new name in {@link SoftwareRegistry.updateSoftware}
	 */
	protected async updateSoftwareRecord<SoftwareType extends Software = SoftwareInDB>
	(name: string, newData: Partial<SoftwareType> & {
		executables?: SoftwareType extends SoftwareInDB ?
			Array<Partial<ExecutableInDB> & { name: string }> : Array<Partial<Executable> & { name: string }>; // Name is required
	}): Promise<void> {
		this.logger.debug(`Updating software record of ${name}...`);
		// Checks if the property is in newData
		const objectHasProperty = (obj: Record<string, unknown>, field: string): boolean => {
			return Object.prototype.hasOwnProperty.call(obj, field) && typeof obj[field] !== "undefined";
		};
		const newDataHasProperty = (field: string): boolean => {
			return objectHasProperty(newData, field);
		};
		// Generate update key = value pairs
		const generateKeyValues = (params, exclude: string[] = []): string => {
			let stmt = "";
			const lastKey = Object.entries(params)[Object.entries(params).length - 1][0]; // So we know when NOT to add the comma
			for (const param in params) {
				if (Object.prototype.hasOwnProperty.call(params, param) && !exclude.includes(param)) {
					// Add it
					// Chop off the `@` as well
					stmt += ` ${param.slice(1)} = ${param}${param !== lastKey ? "," : ""}\n`; // \n so statments are not joined
				}
			}
			return stmt;
		};
		await this.initDB();
		// ID is required so we can locate software in DB, this is easier than an originalName field
		const softwareIdQueryResults = await this.db.get<{ id: string }>(`SELECT id FROM ${SOFTWARE_TABLE_NAME} WHERE name = ? AND ownerName = ?`, [name, this.package.name]);
		if (typeof softwareIdQueryResults === "undefined") {
			throw new Error(`Could not find the ID of software ${newData.name || name} in DB! The software may not be in the DB.`);
		}
		this.logger.debug("Software ID: " + softwareIdQueryResults.id);
		// Params for software UPDATE
		const params = {
			"@id": softwareIdQueryResults.id,
			"@ownerName": this.package.name,
			...newDataHasProperty("name") && { "@name": newData.name },
			...newDataHasProperty("url") && { "@url": newData.url },
			...newDataHasProperty("homepage") && { "@homepage": newData.homepage },
			...newDataHasProperty("downloadType") && { "@downloadType": newData.downloadType },
			...newDataHasProperty("noAutoInstall") && { "@noAutoInstall": newData.noAutoInstall ? SQLBool.True : SQLBool.False },
		};
		const queryKeyValues = generateKeyValues(params, ["@id", "@ownerName"]);
		if (queryKeyValues !== "") {
			// Update as there is stuff to update
			const queryText = `
			UPDATE ${SOFTWARE_TABLE_NAME} SET
			${generateKeyValues(params, ["@id", "@ownerName"])}
			WHERE id = @id AND ownerName = @ownerName;
			`;
			this.logger.debug(queryText);
			// Generate statement
			const stmt = await this.db.prepare(queryText);
			this.logger.debug("Running query...");
			await stmt.all(params);
		} else {
			this.logger.warn("Nothing updated as no params to update.");
		}
		// Update executables
		this.logger.debug("Updating executables in DB...");
		this.logger.debug("Generating promises...");
		const executableUpdatePromises = newData.executables?.map(async (executable: Partial<ExecutableInDB> & { name: string }) => { // Name is required
			this.logger.debug(`Updating executable ${executable.name || "*"}...`);
			let executableParams;
			let executablesStmt: Statement;
			// Create params
			const testRetrival = await this.db.get(`SELECT * FROM ${EXECUTABLES_TABLE_NAME} WHERE name = ? AND softwareId = ?`, [executable.name, softwareIdQueryResults.id]);
			// If it is inside the DB, the above value will NOT be undefined, and so we update
			if (typeof testRetrival === "undefined") {
				this.logger.debug(`Using an INSERT on ${executable.name}...`);
				if (typeof executable.path === "undefined") {
					throw Error(`No path found on executable ${executable.name}!`);
				}
				// Not there
				// Get params
				executableParams = {
					"@name": executable.name,
					"@id": uuid.v4(),
					"@path": Object.prototype.hasOwnProperty.call(executable, "userInstalled") && executable.userInstalled ?
						executable.path : join(this.getOneSoftwareFolder(newData.name || name), executable.path),
					"@arch": executable.arch,
					"@os": executable.os || process.platform,
					"@userInstalled": Object.prototype.hasOwnProperty.call(executable, "userInstalled") && executable.userInstalled ? SQLBool.True : SQLBool.False,
					"@softwareId": softwareIdQueryResults.id,
				};
				// Use an INSERT
				// Literally copied from installSoftware()
				executablesStmt = await this.db.prepare(
					`INSERT INTO ${EXECUTABLES_TABLE_NAME}
					(id, name, path, arch, os, userInstalled, softwareId)
					VALUES (@id, @name, @path, @arch, @os, @userInstalled, @softwareId)`
				);
			} else {
				this.logger.debug(`Using an UPDATE on ${executable.name}...`);
				executableParams = {
					"@name": executable.name,
					"@softwareId": softwareIdQueryResults.id,
					// Typeof requred here so TS listens to it
					...typeof executable.path !== "undefined" && {
						"@path": Object.prototype.hasOwnProperty.call(executable, "userInstalled") && executable.userInstalled ?
							executable.path : join(this.getOneSoftwareFolder(newData.name || name), executable.path)
					},
					...objectHasProperty(executable, "arch") && { "@arch": executable.arch },
					...objectHasProperty(executable, "os") && { "@os": executable.os }, // process.platform is already in DB
					...objectHasProperty(executable, "userInstalled") && { "@userInstalled": executable.userInstalled ? SQLBool.True : SQLBool.False }
				};
				executablesStmt = await this.db.prepare(
					`UPDATE ${EXECUTABLES_TABLE_NAME}
					SET 
					${generateKeyValues(executableParams)}
					WHERE name = @name AND softwareId = @softwareId`
				);
			}
			// Provide params and do it
			return executablesStmt.all(executableParams);
		});
		// Do inserts
		this.logger.debug("Running executable inserts...");
		await Promise.all(executableUpdatePromises || []);
		// DONE!
		this.logger.debug("Done.");
		return;
	}
	/**
	 * Deletes an executable from the DB
	 * @param softwareOwner Software that the executable belongs to
	 */
	public async deleteExecutable(softwareOwner: string, executableName: string): Promise<ISqlite.RunResult> {
		this.logger.info(`Deleting executable ${executableName} from DB...`);
		const { id } = await this.getSoftware(softwareOwner);
		// Delete
		return this.db.run(`DELETE FROM ${EXECUTABLES_TABLE_NAME} WHERE name = ? AND softwareId = ?`, [ executableName, id ]);
	}
	/**
	 * Renames an executable in the DB
	 * @param softwareOwner Software that the executable belongs to
	 * @param executableName Original executable name
	 */
	public async renameExecutable(softwareOwner: string, executableName: string, newName: string): Promise<ISqlite.RunResult> {
		this.logger.info(`Renming executable ${executableName} to ${newName} in DB...`);
		const { id } = await this.getSoftware(softwareOwner);
		// Delete
		return this.db.run(`
			UPDATE ${EXECUTABLES_TABLE_NAME}
			SET
			name = ?
			WHERE name = ? AND softwareId = ?;`, [newName, executableName, id]);
	}

	/**
	 * Uninstalles a piece of software,
	 * first by deleting the software files
	 * and then deleting the registry entry
	 * @param name Name of software to uninstall
	 */
	public async uninstallSoftware(name: string): Promise<ISqlite.RunResult> {
		this.logger.info(`Uninstalling software ${name}`);
		this.logger.debug("Deleteing diretory...");
		await rimraf(this.getOneSoftwareFolder(name));
		this.logger.debug("Now for the DB...");
		const result = await super.uninstallSoftware(name, this.package.name);
		if (typeof result.changes === "undefined" || !result.changes || result.changes < 1) {
			this.logger.warn("No changes to DB detected! Software may not have been removed (or just didn't exist!");
		}
		return result;
	}

	// Query wrappers
	/**
	 * Retrieves a **SINGLE** executable for a **SINGLE** piece software from the DB.
	 * Use getExecutables for multiple.
	 * 
	 * @see SoftwareRegistryQueryProvider.getExecutables
	 * @param software Name of software
	 * @param name Name of executable
	 */
	public async getExecutable(software: string, name: string): Promise<ExecutableInDB> {
		// It's impossible to have duplicates, so just getting 1 is fine
		const results = await this.getExecutables(software, name);
		if (results.length < 1) {
			throw new CodedError(`Could not find executable ${name} in DB! (note: not a Node.js FS Error)`, "ENOENT");
		}
		return results[0];
	}

	/**
	 * Allow multiple executables for one piece of software to be retrieved (by omitting the name field)
	 */
	public async getExecutables(software: string, name: string | null = null): Promise<ExecutableInDB[]> {
		return super.getExecutables(software, name, this.package.name);
	}

	/**
	 * Retrieves a **SINGLE** piece of software from the DB.
	 * Please look at {@link SoftwareRegistryQueryProvider.getSoftwares} for more info, such as constraints.
	 * @param name Name of software to get.
	 */
	public async getSoftware(name: string): Promise<SoftwareInDB> {
		const results: SoftwareInDB[] = await super.getSoftwares(name, this.package.name);
		// I should note it's impossible to get > 1 result back (SQL Constraints prevent it)
		// Handle no results
		if (results.length < 1) {
			throw new CodedError(`Could not find software ${name} in DB! (note: not a Node.js FS Error)`, "ENOENT");
		}
		return results[0];
	}

	/**
	 * Retrieves all pieces of software from the DB.
	 * Please look at {@link SoftwareRegistryQueryProvider.getSoftwares} for more info, such as constraints.
	 */
	public async getAllSoftware(): Promise<SoftwareInDB[]> {
		return super.getSoftwares(null, this.package.name);
	}

	/**
	 * Prevent use of getSoftwares.
	 * 
	 * This placeholder exists as add-on should not be using getSoftwares()
	 */
	public async getSoftwares(name: string): Promise<SoftwareInDB[]> {
		this.logger.warn("Don't use getSoftwares(): use getSoftware() instead");
		return [ await this.getSoftware(name) ];
	}

	/**
	 * Gets software folder root
	 */
	public getSoftwareFolderRoot(): string {
		return super.getSoftwareFolderRoot(this.package.name);
	}

	/**
	 * Gets folder for a given piece of software
	 */
	public getOneSoftwareFolder(softwareName: string): string {
		return super.getOneSoftwareFolder(softwareName, this.package.name);
	}


} 