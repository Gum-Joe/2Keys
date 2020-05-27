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
 * Constants
 * @packageDocumentation
 */

export const PACKAGE_VERSION = require("../../package.json").version;

export const REGISTRY_FILE_NAME = "twokeys-registry.db";

/** The default package.json file created that represents what's installed in the registry */
export const DEFAULT_REGISTRY_ROOT_PACKAGE_JSON = {
	DO_NOT_MODIFY: true,
	name: "twokeys-local-registry",
	version: PACKAGE_VERSION,
	private: true,
	dependencies: {},
};

/** Name of table in the sqlite3 regstry DB to insert add-ons to */
export const REGISTRY_TABLE_NAME = "packages";
/** SQL Query to create packages table */
export const CREATE_REGISTRY_DB_QUERY = `CREATE TABLE ${REGISTRY_TABLE_NAME} (
	id TEXT,
	name TEXT,
	types TEXT,
	info TEXT,
	entry TEXT,
	PRIMARY KEY (id),
	UNIQUE(name)
)`;

/** Folder in registry where modules are */
export const REGISTRY_MODULE_FOLDER = "node_modules";
/** Folder tp store software in in registry root */
export const SOFTWARE_ROOT_FOLDER = "software";

/** Name of table to store software in */
export const SOFTWARE_TABLE_NAME = "software";
/** Name of table to store executables for software in */
export const EXECUTABLES_TABLE_NAME = "executables";
/** SQL Query to create software table. Owner field is the add-on that is repsonsible for that software */
export const CREATE_SOFTWARE_DB_QUERY = `CREATE TABLE ${SOFTWARE_TABLE_NAME} (
	id TEXT,
	name TEXT,
	url TEXT,
	homepage TEXT,
	ownerName TEXT,
	installed BOOLEAN NOT NULL CHECK (installed IN (0,1)),
	downloadType TEXT,
	PRIMARY KEY (id),
	UNIQUE (name, ownerName),
	FOREIGN KEY (ownerName)
       REFERENCES ${REGISTRY_TABLE_NAME} (name)
)`;
/** SQL Query to create software table. Owner field is the add-on that is repsonsible for that software */
export const CREATE_EXECUTABLES_DB_QUERY = `CREATE TABLE ${EXECUTABLES_TABLE_NAME} (
	id TEXT,
	name TEXT,
	path TEXT,
	arch TEXT,
	os TEXT,
	userInstalled BOOLEAN NOT NULL CHECK (userInstalled IN (0,1)),
	softwareId TEXT,
	PRIMARY KEY (id),
	UNIQUE (name, softwareId),
	FOREIGN KEY (softwareId)
       REFERENCES ${SOFTWARE_TABLE_NAME} (id)
)`;
