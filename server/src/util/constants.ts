import { join } from "path";
import { homedir } from "os";
import { AppPath, AppPaths, Keyboard, UserspaceConfig } from "./interfaces";

/**
 * @overview Constants for 2Keys
 */
export const DEBUG: string = "debug";
export const DEFAULT_PORT: number = 9090;
export const CONFIG_FILE: string = "config.yml";
//export const AHK_LIB_PATH: string = "D:\\Users\\Kishan\\Documents\\Projects\\2Keys\\cli\\lib\\ahkdll-v1-release-master\\x64w\\AutoHotkey.dll";
export const AHK_LIB_PATH: string = "D:\\Users\\Kishan\\Documents\\Projects\\2Keys\\cli\\lib\\ahkdll-v2-release-master\\x64w\\AutoHotkey.dll";
export const AHK_DOWNLOAD_PATH = "https://codeload.github.com/HotKeyIt/ahkdll-v2-release/zip/master";
export const AHK_VERSION = "2.0.0-alpha"

// Default paths
export const DEFAULT_USERSPACE_ROOT: string = join(homedir(), ".2Keys");
export const DEFAULT_USERSPACE_CONFIG: string = join(homedir(), ".2Keys.rc.yml");
export const DEFAULT_USERSPACE_SOFTWARE_ROOT: string = join(DEFAULT_USERSPACE_ROOT, "software");
export const DEFAULT_USERSPACE_SOFTWARE_DOWNLOAD: string = join(DEFAULT_USERSPACE_SOFTWARE_ROOT, ".tmp"); // Where to download files to
export const DEFAULT_USERSPACE_SOFTWARE_PATHS: AppPaths = {
  ahk: {
    root: join(DEFAULT_USERSPACE_SOFTWARE_ROOT, "ahk"),
    dll: "./x64w/AutoHotkey.dll",
    exe: "./x64w/AutoHotkey.exe"  
  }
}
export const default_userspace_config: UserspaceConfig = {
  oobe: false,
  paths: {
    root: DEFAULT_USERSPACE_ROOT,
    software: DEFAULT_USERSPACE_SOFTWARE_ROOT,
  },
  software: {
    ahk: {
      version: "2.0.0-alpha",
      paths: {
        root: "./ahk",
        dll: "./x64w/AutoHotkey.dll",
        exe: "./x64w/AutoHotkey.exe",
      },
    },
  },
}
export const DEFAULT_HOTKEY_FILE_ROOT: string = "index.ahk";