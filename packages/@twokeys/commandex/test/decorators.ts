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
 * Contains code to tests decorators
 */
import chai, { expect } from "chai";
import { BaseCommand } from "../src/helpers";
import registerStatefulCommand from "../src/helpers/decorators/registerStatefulCommand";
import fromFactoryCreateInstanceOf from "../src/helpers/decorators/fromFactoryCreateInstanceOf";
import { InstanceGenerator, Constructor } from "../src/util/types";
import { Test } from "mocha";
import { CommandInfo } from "../src/util/interfaces";

chai.use(require("chai-as-promised"));

describe("Decorator tests", () => {
	describe("@registerStatefulCommand", () => {
		it("should add commandInfo to a class", async () => {
			const commandNameHere = "willAddCommandInfoToAClass";
			@registerStatefulCommand(commandNameHere)
			class TestClass1 extends BaseCommand {
				async run(): Promise<void> {
					throw new Error("If this is thrown, it ran");
				}
			}

			// Test
			expect(TestClass1).to.have.ownProperty("commandInfo");
			expect(TestClass1.commandInfo).to.deep.equal({
				name: commandNameHere,
			});
			await expect(new TestClass1().run()).to.be.rejected;
		});

		it("should throw an error if the name is not valid JS", () => {
			const commandNameHere = "command With A Space";
			expect(() => {
				@registerStatefulCommand(commandNameHere)
				class TestClass1 extends BaseCommand {
					async run(): Promise<void> { return; }
				}
			}).to.throw(/Invalid command name/);

		});
	});

	describe("@fromFactoryCreateInstanceOf()", () => {
		it("should add a type to the map", () => {
			class InstanceOfThisCreated {
				public testProperty = "TEST"
			}
			const instanceGenerator: InstanceGenerator<InstanceOfThisCreated> = (commandInfo: CommandInfo, TypeToGenerate: Constructor<InstanceOfThisCreated>) => {
				return new TypeToGenerate();
			} 
			@fromFactoryCreateInstanceOf(0, InstanceOfThisCreated, instanceGenerator)
			class TestClass1 extends BaseCommand {
				async run(): Promise<void> {
					throw new Error("If this is thrown, it ran");
				}
			}

			// Assert
			expect(TestClass1.commandTypeMap.has(InstanceOfThisCreated)).to.be.true;
			expect(TestClass1.commandTypeMap.get(InstanceOfThisCreated)).to.deep.equal({
				forArgumentIndex: 0,
				instanceGenerator,
			});
			expect(instanceGenerator({
				name: "test"
			}, InstanceOfThisCreated)).to.be.instanceOf(InstanceOfThisCreated);
		})
	});
	
	
});
