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
 * @license
 */
/**
 * Common types required by all types of add-on
 * @packageDocumentation
 */
import TwoKeys from "./twokeys";
import { TWOKEYS_ADDON_TYPES } from "../util/interfaces";

/**
 * Interface for setup descriptors.
 * These are what define the questions the 2Keys runner (that is the GUI or CLI) should ask a user
 * when running setup for an appropriate action
 * 
 * Example:
 * ```json
 * {
 * 	"name": "IP Address",
 * 	"inputType": "LINE_TEXT",
 * 	"type": "string";
 * }
 * ```
 */
export interface ConfigDescriptor {
	// TODO: Implement
	[key: string]: string;
}

/** A list of config descriptors ({@link ConfigDescriptor}) */
export type ConfigDescriptors = ConfigDescriptor[];

/**
 * Describes a series of steps that will be displayed to the users as to what a detector controller will do
 * to setup a detector.
 * The index in the array represents the step number.
 */
export interface StepsExplainer {
	/** Header to display */
	header: string;
	/** Body text */
	explainer: string;
}

/**
 * Defines a generic task function used to execute addon tasks, such as:
 * - Setup of a detector
 * - Execution of a hotkey
 * @param twokeys An object provided to the task function that allow it to interact with 2Keys and access function for, for example, logging
 * @param config Config object to pass to function
 * @template GenericConfigT Generic where the config the add-on wants is defined
 * @template ReturnG An optional return type for the Promise
 */
export type TaskFunction<GenericConfigT, ReturnG = void, AddOnsType extends TWOKEYS_ADDON_TYPES = TWOKEYS_ADDON_TYPES> = (twokeys: TwoKeys<AddOnsType>, config: GenericConfigT) => Promise<ReturnG>;

/** Defines the base properties for ALL add-ons */
export interface BaseAddon<AddonType extends TWOKEYS_ADDON_TYPES> {
	/** Options to present to user when running install func */
	installOptions?: ConfigDescriptors;
	/** Function that runs when installing the add-on, doing, for example, downloading (executor) software */
	install?: TaskFunction<any, void, AddonType>;
}