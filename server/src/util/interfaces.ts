export interface Logger {
  name: string;
  windowLogger?: boolean;
}

export interface LoggerTypes {
  level: "info" | "warn" | "error" | "debug";
  colour: string;
  text: string;
  args: Logger;
}

export interface Hotkey {
  type: "down" | "up";
  func: string;
}

export interface Hotkeys {
  [key: string]: Hotkey[] | string;
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
export interface FileTreeNode {
  type: "file" | "dir" // File or dir?
  path: string // Full path to the file
}

/**
 * Interface for files
 */
export interface FileTreeDir extends FileTreeNode {
  contents: FileTreeNode[];
}