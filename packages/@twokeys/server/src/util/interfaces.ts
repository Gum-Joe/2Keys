/**
Copyright 2018 Kishan Sambhi

This file is part of 2Keys.

2Keys is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

2Keys is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
*/
export { Logger, LoggerTypes } from "@twokeys/core/src/interfaces";

export interface Hotkey {
  type: "down" | "up";
  func: string;
}

export interface Hotkeys {
  [key: string]: Hotkey | string;
}

export interface Keyboard {
  path: string; // Path to watch on pi
  dir: string; // Dir of hotkeys
  root: string; // Root AHK file with all hotkeys
  map?: Map<string, number>;
  hotkeys: Hotkeys
}

export interface Config {
  name: string; // Used for naming startup services
  keyboards: {
    [propName: string]: Keyboard;
  };
  addresses: { // IPv4 addresses
    server: {
      ipv4: string;
      port: number;  // Port number
    };
    detector: string;
  }
  perms?: { // Permissions
    ssh: boolean; // Allow us to auto run setup and startup and 2Keys command on the pi via SSH
  }
}

/**
 * For default app paths in constants.DEFAULT_APP_PATHS
 * @interface AppPath
 * @param root Absolute root path for app, where all of the app is
 * @param dll (Optional) Relative path to a DLL to load
 * @param exe (Optional) Relative path to a EXE to run
 */
export interface AppPath {
  root: string,
  dll?: string,
  exe?: string
}

/**
 * Index type of constants.DEFAULT_APP_PATH
 */
export interface AppPaths {
  [index: string]: AppPath
}

export interface UserspaceConfigSoftwareConfig {
  version: string | number;
  paths: {
    root: string; // Root of where software contents are, relative to paths.software
    dll?: string; // Path to DLL to use from software, relative to this.paths.root
    exe?: string; // Path to EXE to use from software, relative to this.paths.root
  };
}
/**
 * Config for Userspace
 * See /example/config_userspace.yml
 */
export interface UserspaceConfig {
  oobe: boolean; // Has OOBE been done?
  paths: {
    root: string; // Absolute path to 2Keys usersapce root.  Default: /home/.2Keys (where home is user folder)
    software: string; // Relative to root, is where downloaded software is
  };
  software: {
    [index: string]: UserspaceConfigSoftwareConfig;
  };
}

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

/**
 * Hotkey that can be up or down, specifiying how the required functions should be stored
 */
export interface HotKeyUpDown {
  up: string;
  down: string;
}
/**
 * Fetch hotkey interface
 */
export interface FetchHotkey {
  file: string;
  func: string | HotKeyUpDown;
  type: string;
}

/**
 * EVDEV value mapping
 */
export enum EvDevValues {
  Up = 0,
  Down, // 1
}