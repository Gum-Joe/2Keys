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
  keyboards: Keyboard[];
}