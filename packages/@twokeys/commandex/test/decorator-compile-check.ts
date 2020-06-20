// Ideal decorator implementation
// IF THIS DOES NOT COMPILE, SOMETHING IS WRONG WITH TYPINGS

import fromFactoryCreateInstanceOf from "../src/helpers/decorators/fromFactoryCreateInstanceOf";
import mapCommandArgumentToWrapper from "../src/helpers/decorators/mapCommandArgumentToWrapper";
import { BaseCommand } from "../src/helpers";
import { InstanceGenerator } from "../src/util/types";
import { CommandInfo } from "../src/util/interfaces";
import registerStatefulCommand from "../src/helpers/decorators/registerStatefulCommand";

// Mock class to test mapping
class TestClassArgument {
	constructor(public testArgument: string) {}
}
// And an instance generator
const instanceGenerator: InstanceGenerator<TestClassArgument> = (commandInfo: CommandInfo, TypeToGenerate: typeof TestClassArgument) => {
	return new TypeToGenerate(commandInfo.name);
};

// We then define this base command in our own modules
// Below: this decorator takes a variable of the factory that is typeof TwoKeys
// and uses instance Generator to create an instance of it
@fromFactoryCreateInstanceOf(0, TestClassArgument, instanceGenerator)
/// Below: tells compiler to map argument 0 of the wrapper function to argument of index 1 of the command
// and name the argument "config" in the factory
@mapCommandArgumentToWrapper(1, 0, "config")
abstract class BaseCommandHere<Config> extends BaseCommand {
	constructor(public twokeys: TestClassArgument, public config: Config) {
		super();
	}
}

// Attempt to make a command
interface MockConfig {
	someProp: boolean;
}

@registerStatefulCommand("someCommand") // Registers a command that is a class, providing props (the commandInfo property) in the class which the compiler looks for
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Command extends BaseCommandHere<MockConfig> {

	public async run(): Promise<string> {
		return "h";
	}

}