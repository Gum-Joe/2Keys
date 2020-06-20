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
// Mock of how it will all work

// What would be the TwoKeys object that we will pass through
class TwoKeys { }

// Template file that defines what a command factory looks like
class CommandFactory {
	constructor(public TwoKeysConstructor: typeof TwoKeys) { }

	// { commands }
}

// Mock interface of info describing a command
// This is added to a function using Object.defineProperty()
// or as a property to a BaseCommandInModule - see this class for more info
interface CommandInfo {
	name: string;
}

// Base command in module (that is exported by commandex)
abstract class BaseCommandInModule {
	// Function that does stuff
	abstract async run(): Promise<any>;

	// Properties defined by (put there by) @registerStatefulCommand
	public commandInfo!: CommandInfo
}

// We then define this base command in our own modules
// Below: this decorator takes a variable of the factory that is typeof TwoKeys
// and uses instance Generator to create an instance of it
@fromFactoryCreateInstanceOf(0, TwoKeys, instanceGenerator)
/// Below: tells compiler to map argument 0 of the wrapper function to argument of index 1 of the command
// and name the argument "config" in the factory
@mapCommandArgumentFromFactory(0, 1, "config")
abstract class BaseCommand<Config> extends BaseCommandInModule {
	constructor(public twokeys: TwoKeys, public config: Config) {
		super();
	}
}


// This is what is used above to generate instances of TwoKeys
// see completed command factory for usage of this
// If BaseType is not labelled as the right type for what this is used for
// a compile error will occur
function instanceGenerator(commandInfo: CommandInfo, BaseType: typeof TwoKeys) {
	return new BaseType();
}

@registerStatefulCommand("commandName") // Registers a command that is a class, providing props (the commandInfo property) in the class which the compiler looks for
class Command extends BaseCommand<boolean> {

	public async run(): Promise<string> {
		return "h";
	}

}

// A function
function someCommand(twokeys: TwoKeys, config: { someArg: string }) {
	console.log("Ran");
}

// Wrap it
// You can wrap functions, so they'll likely be a warp function command where you can call all the wrapper you want
// like fromFactoryCreateInstanceOf and mapCommandArgumentFromFactory
const someCommandWraped = registerCommand("someCommand", someCommand);

// Pseudo wrap function, to show how it would work
function registerCommand(name: string, func: Function) {
	Object.defineProperty(func, "isCommand", true);
	Object.defineProperty(func, "commandName", name);
	return func;
}

// Generated command factory
// the compiler creates and then compiles this
// hopefully if there is a compile error this is a config error, not a problem with the compiler itself
class CommandFactory2 {
	constructor(public TwoKeysConstructor: typeof TwoKeys) { }

	public CommandA(config: ConstructorParameters<typeof Command>[1]) {
		return new Command(new this.TwoKeysConstructor(), config);
	}

	// And a wrapped function looks like this
	public someCommand(config: Parameters<typeof someCommand>[1]) {
		return someCommand(instanceGenerator({ name: "TEST" }, this.TwoKeysConstructor), config);
	}
}

// Usage
const factory = new CommandFactory2(TwoKeys);
factory.CommandA(true).run();
// or
factory.someCommand({ someArg: "hi" });