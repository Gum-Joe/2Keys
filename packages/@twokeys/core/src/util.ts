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
/**
 * Contains useful utilty functions, such as decorators and type helpers
 * Note: to use decorators, expiermental decorator support must be enabled in TSConfig
 * @packageDocumentation
 */

/**
 * Decorator to implement static properties on a class from an interface.
 * From https://stackoverflow.com/questions/13955157/how-to-define-static-property-in-typescript-interface/43674389#43674389
 */
export default function implementsStaticProperties<T>() {
	return <U extends T>(constructor: U): U => constructor;
}

/** 
 * Gets the constructor of T
 * @template T Type to get constructor for
 */
export type Constructor<T> = { new(...args: any[]): T }; // From https://www.simonholywell.com/post/typescript-constructor-type.html

/**
 * Gets the constructor of T, where T is an abstract class
 * @template T Type to get constructor for
 */
export type AbstractConstructor<T> = Function & { prototype: T } // From https://stackoverflow.com/questions/36886082/abstract-constructor-type-in-typescript