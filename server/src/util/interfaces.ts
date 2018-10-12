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

export interface Keyboard {
  path: string; // Path to watch on pi
  dir: string; // Dir of hotkeys
  root: string; // Root AHK file with all hotkeys
  map?: Map<string, number>;
  hotkeys: Hotkey[] | string;
}

export interface Config {
  keyboards: {
    [propName: string]: Keyboard;
  };
  addresses: { // IPv4 addresses
    server: string;
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