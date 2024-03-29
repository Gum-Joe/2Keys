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
import mkdirp from "mkdirp";
import path from "path";
import ProgressBar from "progress";
import fs, { readdir as readdirRaw, access as accessRaw, stat as statRaw, read } from "fs";
import { promisify } from "util";
import Logger from "./logger";
import { FileTreeFile, FileTreeDir, FileTreeNodes, FileTreeNode } from "./interfaces";

const readdir = promisify(readdirRaw);
const stat = promisify(statRaw);
const logger = new Logger({
	name: "copy"
});

/**
 * Generates a file tree of all the files
 * @param root Root dir to start at
 */
function generate_file_tree(root: string): Promise<FileTreeNodes<FileTreeNode>[]> {
	return new Promise(async (resolve, reject) => {
		const files: FileTreeNode[] = [];
		try {
			const contents = await readdir(root);
			for (const file of contents) {
				const absolutePath = path.join(root, file);
				// Dir or file?
				const status = await stat(absolutePath);
				if (status.isDirectory()) {
					// Is dir, run this func on it
					const dirNode: FileTreeDir = {
						type: "dir",
						path: absolutePath,
						contents: await generate_file_tree(absolutePath),
					};
					files.push(dirNode);
				} else {
					// It's a file!
					files.push({
						type: "file",
						path: absolutePath
					});
				}
			}
		} catch (err) {
			reject(err);
		} finally {
			resolve(files);
		}
	});
}

/**
 * Gets a list of dirs in a tree
 * @param tree Tree generated byg enerate_file_tree()
 */
function get_dirs_from_tree(tree: FileTreeNodes<FileTreeNode>[]): Promise<string[]> {
	return new Promise(async (resolve, reject) => {
		const dirs: string[] = [];
		for (const node of tree) {
			// 1: check type
			if (node.type === "file") {
				continue;
			} else if (node.type === "dir") {
				// Add to list, rerun function on it
				dirs.push(node.path);
				const nextDirs = await get_dirs_from_tree(node.contents); // Dirs in this current dir
				nextDirs.forEach(dir => dirs.push(dir));
			} else {
				reject(new Error("Invalid file type! Only dir and file are allowed.")); // TS complains if path is here
			}
		}
		// Resolve
		resolve(dirs);
	});
}

/**
 * Gets a list of files in a tree
 * @param tree Tree generated byg enerate_file_tree()
 */
function get_files_from_tree(tree: FileTreeNode[]): Promise<string[]> {
	return new Promise(async (resolve, reject) => {
		const files: string[] = [];
		for (const node of tree) {
			// 1: check type
			if (node.type === "dir") {
				// Run function on dir to get files from it
				const nextFiles = await get_files_from_tree(node.contents); // Dirs in this current dir
				nextFiles.forEach(file => files.push(file));
			} else if (node.type === "file") {
				// It's a file, add it
				files.push(node.path);
			} else {
				reject(new Error("Invalid file type! Only dir and file are allowed")); // TS complains if path is here
			}
		}
		// Resolve
		resolve(files);
	});
}

function mkdirs(root: string, destination: string, progress_bar: ProgressBar, dirs: string[]): Promise<{}> {
	return new Promise((resolve, reject) => {
		// MKDIR
		for (const dir of dirs) {
			// Make relative to root, then attach dest to start i.e.
			// C:\AHK\ahk-v2 => .\ahk-v2 -> D:\software\.\ahk-v2
			const relativeDir = path.join(destination, path.relative(root, dir));
			mkdirp(relativeDir)
				.then(() => {
					progress_bar.tick({
						action: "mkdir",
						symbol: ">>",
						dest: relativeDir,
					});
					// At end?
					if (dir === dirs[dirs.length - 1]) {
						resolve();
					}
				})
				.catch(reject);
		}
	});
}

/**
 * Copies the contents of root to the directory destination (i.e. no sub-dir created at dest with the name of root)
 * @param root Root directory with files to copy
 * @param destination Destinatian directory (will be created if it does not exist)
 */
export default async function copy_contents(root: string, destination: string): Promise<{}> {
	return new Promise(async (resolve, reject) => {
		logger.info(`Copying files from ${root} to ${destination}...`);
		logger.debug("Generating file tree...");
		try {
			const tree = await generate_file_tree(root);
			logger.debug("Creating dirs list...");
			const dirs = await get_dirs_from_tree(tree);
			// Do copy action
			logger.debug("Creating file list....");
			const files = await get_files_from_tree(tree);

			// DO IT
			logger.debug("Copying...");
			const total = dirs.length + files.length;
			// Progress bar
			// Where action is "mkdir" or the file being copied
			// And :dest is the file being copied to or dir being made
			const progress_bar = new ProgressBar(":bar :percent .\\:action :symbol :dest", {
				complete: "▓",
				incomplete: "░",
				width: 50,
				total,
				callback: () => resolve(),
			});
			const counter = 0;

			// MKDIR
			// Done this way to ensure dirs are ready
			await mkdirs(root, destination, progress_bar, dirs);

			// COPY
			for (const file of files) {
				const relativePath = path.join(destination, path.relative(root, file));
				const reader = fs.createReadStream(file);
				const writer = fs.createWriteStream(relativePath);

				reader.on("error", err => reject(err));
				writer.on("error", err => reject(err));

				reader.pipe(writer);
				reader.on("close", () => {
					progress_bar.tick({
						action: path.relative(root, file),
						symbol: "->",
						dest: path.relative(root, path.join(destination, path.relative(root, file))),
					});
				});
			}

			// We're done!
		} catch (err) {
			reject(err);
		}
	});
}