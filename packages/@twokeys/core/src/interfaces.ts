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

/** Recursivly make a type writable */
export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

/** Makes some keys from an interface optional */
export type MakeKeysNever<T, K extends keyof T> ={
	[P in keyof T]: P extends K ? undefined : T[P];
}

export type MakeKeysOptional<T, K extends keyof T> = {
	[P in keyof T]: P extends K ? undefined : T[P];
}

/**
 * Defines options for the Logger class
 * @packageDocumentation
 */
export interface LoggerArgs {
	/**
	 * Name of logger, printed in magenta before level and message
	 */
	name: string;
	windowLogger?: boolean;
	/** Optional: provide CLI args to use when decided if to use isDebug, etc */
	argv?: string[];
	loggingMethods?: LoggingMethods;
}

/**
 * Logging methods
 * 
 * Defined the methods a loggers needs
 * in order to log messages
 */
export interface LoggingMethods {
	/** Used for info and debug messages (STDOUT) */
	log(message?: any, ...optionalParams: any[]): void;
	/** Used for warning messages */
	warn(message?: any, ...optionalParams: any[]): void;
	/** Used for error messages (STDERR) */
	error(message?: any, ...optionalParams: any[]): void;
}

/**
 * Default logging methods
 */
export const defaultLoggingMethods: LoggingMethods = console;

export interface LoggerTypes {
	level: "info" | "warn" | "err" | "debug";
	name: string;
	colour: string;
	text: string;
	args?: LoggerArgs;
}

/** Util methods for config for add-ons to allow the modification of config */
export interface ConfigUtils {
	/** Adjust the properties of adjustable options, then call `write()` to write the new config. */
	write: () => Promise<void>;
}

/**
 * Config types
 * See `example` for examples of each
 */

/** Add {@link ConfigUtils} to config types so you can safely use them. */
export type AddConfigUtils<T extends { [key: string]: any }> = T & ConfigUtils

// export type ConfigWithoutUtils<T extends AddConfigUtils<U>, U> = MakeKeysOptional<T, keyof ConfigUtils>;

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
		};
	};
	/**
	 * List of config files for detectors that are used with this project.
	 * This is different from the client config files, as these are stored in the project dir
	 */
	detectors: string[];
	/** Project permissions */
	perms: {
		/**
		 * Sync with 2Keys cloud.
		 * 
		 * **RESERVED FOR FUTURE USE, NOT YET IMPLEMENTED** */
		sync: false;
	};
}

/**
 * Configures a client that is used as a detector.
 * This config is project-agnostic and is stored with the 2Keys Root Config (see interface {@link ServerConfig}).
 * @template ClientConfigType type of config for client that controller provides
 */
export interface ClientConfig<ClientConfigType = any> {
	/** UUID of client, used to reference it in project config so it can be used in projects */
	id: string;
	/** Name of detector */
	name: string;
	/** Controller to use with detector, that is the add-on that holds the server side code for interfacing with the detector */
	controller: string;
	/** Config options to pass to the controller, defined by the controller itself */
	controllerConfig: ClientConfigType;
}

/**
 * Configures an individual hotkey.
 * `TypeSingle` because it only configures for the key balue of down, i.e. when the hotkey keys are pressed down.
 * Other values are up and hold (see interface {@link HotkeyTypeKeypressValue})
 * The actual config here is up to each executor to decide.
 * What's here can override what is in `Keyboard.executors[executor]`.
 */
export interface BaseHotkeyTypeSingle {
	/** Executor to use for this hotkey (defaults to `keyboard[keybaord].executors.default`) */
	executor?: string;
	/**
	 * Macro funcion to execute.
	 * Ideally this would be a string,
	 * however, as different executor may want it to be e.g. an object, `unknown` is used
	 * so that executors can override this.
	 */
	func: unknown;
}

/**
 * Actually hotkey key single type.
 * Takes {@link BaseHotkeyTypeSingle} and adds the config for the executor
 * @template ExecutorConfig config for the executor; overrides keyboard[keybaord].executors[executor] and can also specify type for {@link BaseHotkeyTypeSingle.func}
 */
export type HotkeyTypeSingle<ExecutorConfig = { [key: string]: any }> = BaseHotkeyTypeSingle & ExecutorConfig;

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

/** Hotkey type. Is either {@link HotkeyTypeSingle} or {@link HotkeyTypeKeypressValue} */
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
 * Used in the detector config (interface {@link DetectorConfig})
 */
export interface Keyboard {
	/**
	 * Root folder where all macros are stored
	 * TODO: **Map this to an absolute path when using it. This is not yet done, so please use `twokeys.properties.projectDir` to get project directory, which is what this is relative to**
	 */
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
		 * Config is {@link Executor.hotkeyOptions}
		 */
		[executorName: string]: any;
	};
	/**
	 * Contains detector-specific config that is required per keyboard.
	 * For example, the identifier for the keyboard to watch
	 */
	detector: unknown;
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
 * This is different to the client config file, which is stored the 2Keys Root Config (see interface {@link ServerConfig}).
 * This config is stored with the project config (see interface {@link ProjectConfig}).
 * TODO:  USE A MAP
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
	detector_config: unknown;
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
 * This is the config the configures 2Keys for a specific device.
 * **It is different to the config for one server**
 * It is default stored in {@link TWOKEYS_MAIN_CONFIG_DEFAULT_PATH}
 * @interface MainConfig
 */
export interface MainConfig {
	/** Name of server */
	name: string;
	/** SemVer version of 2Keys used as server */
	version: string;
	/**
	 * Root for registry.
	 * Uses the defaults in @twokeys/addons for files, such as the DB
	 */
	registry_root: string;
	/** 
	 * Has OOBE been ran?
	 */
	oobe: boolean;
	/** Network info */
	network: {
		/** Name of adapter in use */
		adapter: string;
		/** IPv4 address of this server */
		ipv4: string;
	};
}

/** Config for the UI */
export interface UIConfig {
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
}

/**
 * Type to represent one of the above configs (that is loaded from a file)
 */
export type CombinedConfigs = MainConfig | DetectorConfig | ClientConfig | ProjectConfig;
