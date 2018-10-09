import { join } from "path";
import { homedir } from "os";
import { AppPath, AppPaths, Keyboard } from "./interfaces";

/**
 * @overview Constants for 2Keys
 */
export const DEBUG: string = "debug";
export const DEFAULT_PORT: number = 9090;
export const CONFIG_FILE: string = "config.yml";
//export const AHK_LIB_PATH: string = "D:\\Users\\Kishan\\Documents\\Projects\\2Keys\\cli\\lib\\ahkdll-v1-release-master\\x64w\\AutoHotkey.dll";
export const AHK_LIB_PATH: string = "D:\\Users\\Kishan\\Documents\\Projects\\2Keys\\cli\\lib\\ahkdll-v2-release-master\\x64w\\AutoHotkey.dll";

// Default path
export const DEFAULT_TWOKEYS_ROOT: string = join(homedir(), ".2Keys")
export const DEFAULT_APPS_PATH: string = join(DEFAULT_TWOKEYS_ROOT, "apps")
export const DEFAULT_APP_PATHS: AppPaths = {
  ahk: {
    root: join(DEFAULT_APPS_PATH, "ahk"),
    dll: "./x64w/AutoHotkey.dll",
    exe: "./x64w/AutoHotkey.exe"  
  }
}
export const CONFIG_NAME: string = "config.yml";
export const DEFAULT_HOTKEY_FILE_ROOT: string = "index.ahk";