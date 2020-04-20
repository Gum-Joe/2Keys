/**
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
 * Defines options for the Logger class
 */
export interface Logger {
  name: string;
  windowLogger?: boolean;
}

export interface LoggerTypes {
  level: "info" | "warn" | "err" | "debug";
  name: string;
  colour: string;
  text: string;
  args?: Logger;
}

/**
 * Config types
 * See `example` for examples of each
 */
/**
 * Defines the config for a project file.
 * This is the root `config.yml` and is first loaded when 2Keys loads a project
 */
export interface ProjectConfig {
  /** Name of project */
  name: string;
  /** Project UUID, used to uniquely identify projects */
  id: string;
  /** Identify the SemVer version of 2Keys used to create the config, in case of future config changes */
  version: string;
  /** Server settings */
  server: {
    /** Port server runs on */
    port: number;
    /** Permission for the server */
    perms: {
      /** Allow the server to start on startup */
      startOnStartup: boolean;
    }
  };
  /**
   * List of config files for detectors that are used with this project.
   * This is different from the client config files
   */
  detectors: string[];
}

/**
 * Configures a client that is used as a detector.
 * This config is project-agnostic and is stored with the 2Keys Root Config (see interface `2KeysConfig`).
 */
export interface ClientConfig {
  /** UUID of client, used to reference it in project config so it can be used in projects */
  id: string;
  /** Name of detector */
  name: string;
  /** Controller to use with detector, that is the add-on that holds the server side code for interfacing with the detector */
  controller: string;
  /** Config options to pass to the controller, defined by the controller itself */
  controllerConfig: string;
}

/**
 * Configures an individual hotkey.
 * `TypeSingle` because it only configures for the key balue of down, i.e. when the hotkey keys are pressed down.
 * Other values are up and hold (see interface `HotkeyTypeKeypressValue`)
 * The actual config here is up to each executor to decide.
 * It recommened that what's here can override the config in `Keybaord.executors[executor]`
 */
export interface HotkeyTypeSingle {
  /** Executor to use for this hotkey (defaults to `keyboard[keybaord].executors.default) */
  executor?: string;
  /**
   * Config for the executor
   */
  [key: string]: any;
}

/**
 * Configures an individual hotkey,
 * where there are separate events for up and down and hold keypresses
 */
export interface HotkeyTypeKeypressValue {
  /** Up event */
  up?: HotkeyTypeSingle;
  /** Down event */
  down?: HotkeyTypeSingle;
  /** Hold event */
  hold?: HotkeyTypeSingle;
}

/** Hotkey type. Is either `HotkeyTypeSingle` or `HotkeyTypeKeypressValue` */
export type Hotkey = HotkeyTypeSingle | HotkeyTypeKeypressValue;

/**
 * Represents the hotkey map
 */
export interface Hotkeys {
  /**
   * @param hotkey The hotkey code (e.g. ^C) that corresponds to the keys that are pressed to trigger the hotkey
   */
  [hotkey: string]: Hotkey;
}

/**
 * Configures a specific keyboard.
 * Used in the detector config (interface `DetectorConfig`)
 */
export interface Keyboard {
  /** Root folder where all macros are stored */
  root: string;
  /**
   * Contains the executor specific config for executors.
   * This is, for example, the file to load that includes all macros.
   * The key here is the name of the executor.
   * Also contains a `default` key to sepcify the default executor.
   */
  executors: {
    /** Default executor */
    default: string;
    /**
     * @param executorName Name of executor being configured
     */
    [executorName: string]: string | object;
  };
  /**
   * Contains detector-specific config that is required per keyboard.
   * For example, this is the identifier for the keyboard to watch
   */
  detector: object;
  /**
   * Holds the mapping of hotkeys to macros.
   * For example, the macro to run when a hotkey combo is pressed.
   * The key here is the hotkey code.
   * It is up to detectors to decide what hotkey codes (such as ^C) are used
   * as well as what hotkey codes keyboard scan code map to.
   */
  hotkeys: Hotkeys;
}

/**
 * Configures a detector as part of a project.
 * This is different to the client config file, which is stored the 2Keys Root Config (see interface `2KeysConfig`).
 * This config is stored with the project config (see interface `ProjectConfig`).
 */
export interface DetectorConfig {
  /** Name of Detector */
  name: string;
  /** Identifies the client this config file is for */
  client: {
    /** UUID of client to use */
    id: string;
    /** Name of client, added so it's clear to the end-user which device this is referred to.  Is not paid attention to by code. */
    name: string;
  };
  /** Config for detector. It's up to the detector controller to decide what goes here. */
  detector_config: object;
  /**
   * List of keyboard, where `propName` is the keyboard name,
   * that are associated with this detector in this project.
   * @param keyboardName Keyboard name
   */
  keyboards: {
    [keyboardName: string]: Keyboard;
  };
}

/**
 * Interface to define the 'root' config.
 * This is the config the configures a 2Keys server.
 * It is default stored in AppData.
 */
export interface ServerConfig {
  /** Name of server */
  name: string;
  /** SemVer version of 2Keys used as server */
  version: string;
  /**
   * Theme to use.
   * This is disabled as there are no themes
   */
  theme?: "dark" | "light";
  /**
   * Accent colour.
   * Disabled as there's no way to set it.
   * Defaults to system accent
   */
  accent: string;
  /**
   * Location of installed add-ons
   */
  add_ons_location: string;
}
