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
import type ProgressBar from "progress";
import { pipeline as pipelineWithCB } from "stream";
import fs from "fs";
import { promisify } from "util";
import { Logger } from "@twokeys/core";

const { readdir, stat } = fs.promises;
const pipeline = promisify(pipelineWithCB);

/**
 * Interface for each section of the file tree
 */
export interface FileTreeFile {
	type: "file"; // File or dir?
	path: string; // Full path to the file
}

/**
 * Interface for files
 */
export interface FileTreeDir {
	type: "dir";
	path: string; // Full path to the file
	contents: FileTreeNodes<FileTreeNode>[];
}

export type FileTreeNode = FileTreeDir | FileTreeFile;
// The below is a conditional type, allowing the cor rect type to be used when type === "dir" or "file"
export type FileTreeNodes<T> = T extends FileTreeDir ? FileTreeDir : FileTreeFile;

export interface ContentCopierOptions {
	Logger?: typeof Logger;
}

/**
 * Copies the contents of root to the directory destination (i.e. no sub-dir created at dest with the name of root)
 * @param root Root directory with files to copy
 * @param destination Dest directory (will be created if it does not exist)
 */
export default class ContentCopier {
	public root: string;
	public destination: string;

	protected logger: Logger = new Logger({ name: "copy" });
	protected LoggerConstructor: typeof Logger = Logger;

	/**
	* Copies the contents of root to the directory destination (i.e. no sub-dir created at dest with the name of root)
	* @param root Root directory with files to copy
	* @param destination Dest directory (will be created if it does not exist)
	*/
	constructor(root: string, destination: string, options?: ContentCopierOptions) {
		this.root = root;
		this.destination = destination;
		if (typeof options !== "undefined" && typeof options.Logger !== "undefined") {
			this.logger = new options.Logger({ name: "copy" });
			this.LoggerConstructor = options.Logger;
		}
	}

	/**
	 * Copies the contents of root to the directory destination (i.e. no sub-dir created at dest with the name of root)
	 * @param root Root directory with files to copy
	 * @param destination Destinatian directory (will be created if it does not exist)
	 */
	public async copyContents(): Promise<void> {
		this.logger.info(`Copying files from ${this.root} to ${this.destination}...`);
		this.logger.debug("Generating file tree...");
		try {
			const tree = await ContentCopier.generateFileTree(this.root);
			this.logger.debug("Creating dirs list...");
			const dirs = ContentCopier.getDirsFromTree(tree);
			// Do copy action
			this.logger.debug("Creating file list....");
			const files = ContentCopier.getFilesFromTree(tree);

			// DO IT
			this.logger.debug("Copying...");
			const total = dirs.length + files.length;
			let progress_bar: ProgressBar | undefined;
			if (!this.logger.isSilent) {
				// Progress bar
				// Where action is "mkdir" or the file being copied
				// And :dest is the file being copied to or dir being made
				progress_bar = this.logger.createProgressBar(":bar :percent .\\:action :symbol :dest", {
					complete: "▓",
					incomplete: "░",
					width: 50,
					total
				});
			}


			// MKDIR
			// Done this way to ensure dirs are ready
			await this.mkdirs(dirs, progress_bar);

			// COPY
			for (const file of files) {
				this.logger.debug(`Copying to ${path.relative(this.root, path.join(this.destination, path.relative(this.root, file)))}`);
				const relativePath = path.join(this.destination, path.relative(this.root, file));
				const reader = fs.createReadStream(file);
				const writer = fs.createWriteStream(relativePath);

				if (!this.logger.isSilent) {
					reader.on("close", () => {
						progress_bar?.tick({
							action: path.relative(this.root, file),
							symbol: "->",
							dest: path.relative(this.root, path.join(this.destination, path.relative(this.root, file))),
						});
					});
				}

				await pipeline(
					reader,
					writer,
				);
				// Now close stuff
				writer.close();
				reader.close();
			}
			// We're done!
			return;
		} catch (err) {
			this.logger.err("ERROR!");
			throw err;
		}
	}

	/**
	 * Creates a set of directories, relative to root
	 * @param progress_bar 
	 * @param dirs Absolute path to dirctories, which we make relative to destination
	 */
	public mkdirs(dirs: string[], progress_bar?: ProgressBar): Promise<void[]> {
		return Promise.all(dirs.map(async (dir) => {
			const relativeDir = path.join(this.destination, path.relative(this.root, dir));
			return mkdirp(relativeDir)
				.then(() => {
					// TODO: REMOVE
					this.logger.debug(`mkdir ${relativeDir}`);
					progress_bar?.tick({
						action: "mkdir",
						symbol: ">>",
						dest: relativeDir,
					});
				});
		})); 
	}

	/**
   * Generates a file tree of all the files
   * @param root Root dir to start at
   */
	private static async generateFileTree(root: string): Promise<FileTreeNodes<FileTreeNode>[]> {
		const contents = await readdir(root);
		return Promise.all(contents.map(async (file) => {
			const absolutePath = path.join(root, file);
			// Dir or file?
			const status = await stat(absolutePath);
			if (status.isDirectory()) {
				// Is dir, run this func on it
				const dirNode: FileTreeDir = {
					type: "dir",
					path: absolutePath,
					contents: await ContentCopier.generateFileTree(absolutePath),
				};
				return dirNode;
			} else {
				// It's a file!
				return {
					type: "file",
					path: absolutePath
				} as FileTreeFile;
			}
		}));
		/*for (const file of contents) {
			const absolutePath = path.join(root, file);
			// Dir or file?
			const status = await stat(absolutePath);
			if (status.isDirectory()) {
				// Is dir, run this func on it
				const dirNode: FileTreeDir = {
					type: "dir",
					path: absolutePath,
					contents: await ContentCopier.generateFileTree(absolutePath),
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
		return files;*/
	}

	/**
	 * Gets a list of dirs in a tree
	 * @param tree Tree generated
	 */
	private static getDirsFromTree(tree: FileTreeNodes<FileTreeNode>[]): string[] {
		const dirs: string[] = [];
		for (const node of tree) {
			// 1: check type
			if (node.type === "file") {
				continue;
			} else if (node.type === "dir") {
				// Add to list, rerun function on it
				dirs.push(node.path);
				const nextDirs = ContentCopier.getDirsFromTree(node.contents); // Dirs in this current dir
				nextDirs.forEach(dir => dirs.push(dir));
			} else {
				throw new Error("Invalid file type! Only dir and file are allowed."); // TS complains if path is here
			}
		}
		// Resolve
		return dirs;
	}

	/**
	 * Gets a list of files in a tree
	 * @param tree Tree generated
	 */
	private static getFilesFromTree(tree: FileTreeNode[]): string[] {
		const files: string[] = [];
		for (const node of tree) {
			// 1: check type
			if (node.type === "dir") {
				// Run function on dir to get files from it
				const nextFiles = ContentCopier.getFilesFromTree(node.contents); // Dirs in this current dir
				nextFiles.forEach(file => files.push(file));
			} else if (node.type === "file") {
				// It's a file, add it
				files.push(node.path);
			} else {
				throw new Error("Invalid file type! Only dir and file are allowed"); // TS complains if path is here
			}
		}
		// Resolve
		return files;
	}
}