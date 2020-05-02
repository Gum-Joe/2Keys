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

import { Software, Executable } from "./interfaces";
import { Logger } from "@twokeys/core";
import { Database } from "sqlite";

// Interface to implement
interface SoftwareRegI {
	// Properties
	db: Database;
	directory: string;

	// Methods
	/** Intialises the DB */
	initDB(): Promise<void>;
	/** Downloads and installs a piece of software. */
	installSoftware(software: Software): Promise<void>;
	/** Runs install on a piece of software where {@link Software.runInstall} was false */
	runInstall(name: string): Promise<void>;
	/** Uninstall a piece of software */
	uninstallSoftware(name: string): Promise<void>;
	/** Update records for a piece of software */
	updateSoftwareRecord(name: string, newData: Software): Promise<void>;
	/** Get full path to an executable */
	getExecutablePath(software: string, name: string): Promise<string>;
	/** Get executable object */
	getExecutable(software: string, name: string): Promise<Executable>;
	/** Get software object */
	getSoftware(name: string): Promise<Software>;
	/** Converts software in DB to a {@link Software} */
	parseSoftwareFromDB(softwareFromDB: any): Software;
}
/**
 * Software registry class
 * This is a registry of software that is installed for a **specific** add-on.
 * It is stored in 2Keys-root/add-ons/software/<add-on-name> (i.e. as a sub-dir in a add-ons registry).
 */
export default class SoftwareRegistry implements SoftwareRegI {

	public directory: string;
	public db: Database<import("sqlite3").Database, import("sqlite3").Statement>;
	private logger: Logger;

	constructor(directory: string) {
		this.directory = directory;
	}
	initDB(): Promise<void> {
		throw new Error("Method not implemented.");
	}
	installSoftware(software: Software): Promise<void> {
		throw new Error("Method not implemented.");
	}
	runInstall(name: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	uninstallSoftware(name: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	updateSoftwareRecord(name: string, newData: Software): Promise<void> {
		throw new Error("Method not implemented.");
	}
	getExecutablePath(software: string, name: string): Promise<string> {
		throw new Error("Method not implemented.");
	}
	getExecutable(software: string, name: string): Promise<Executable> {
		throw new Error("Method not implemented.");
	}
	getSoftware(name: string): Promise<Software> {
		throw new Error("Method not implemented.");
	}
	parseSoftwareFromDB(softwareFromDB: any): Software {
		throw new Error("Method not implemented.");
	}


} 