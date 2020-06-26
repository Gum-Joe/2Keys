/**
 * Class used to call commands
 * @packageDocumentation
 */

import { FinalTwoKeysConstructor } from "./twokeys";
import { Command, CommandInfo, BaseStatefulCommand, StatefulCommandConstructor } from "./base-commands";

/**
 * Provides the needed methods to call commands,
 * allowing commands to be called without having to create a instance of TwoKeys manually every time.
 * 
 * Full Usage:
 * @example
 * ```typescript
 * import BaseTwoKeysForCommands, { CommandFactory, ensureIsValidTwoKeysClass }, { FinalTwoKeysConstructor } from "@twokeys/common-hi/lib/common/twokeys";
 * import { Logger } from "@twokeys/core";
 *
 * // First create a TwoKeys class to use:
 * @ensureIsValidTwoKeysClass // It's reccomended you add this line, it ensures you have the right constructor
 * class TwoKeys extends BaseTwoKeysForCommands {
 * 	constructor(commandInfo: CommandInfo) {
 * 		// Simple TwoKeys class, just used to set a default logger
 * 		super(Logger, commandInfo);
 * 	}
 * }
 *
 * // Then create a CommandFactory:
 * const commandFactory = new CommandFactory(TwoKeys);
 *
 * // Now here's a command:
 * // Define a config
 * interface ConfigType {
 * 	name: string;
 * }
 * // Define the command itself
 * const someCommand: Command<ConfigType> = (twokeys: TwoKeys, config: ConfigType) => {
 * 	twokeys.logger.info("IT worked!");
 * 	twokeys.logger.info(config.name);
 * }
 *
 * // Next, wrap it to create a command
 * const wrappedCommand = CommandFactory.wrapCommand(someCommand, "someCommand");
 *
 * // And now we call it
 * commandFactory.callCommand(someCommand, { name: "someName" });
 * ```
 */
export default class CommandFactory {
	/**
	 * Create a CommandFactory
	 * @param TwokeysConstructor The TwoKeys class to use when calling commands
	 */
	constructor(public TwokeysConstructor: FinalTwoKeysConstructor) {}

	/**
	 * Calls a stateless command
	 * **Note: Make sure all properties in {@link CommandInfo} are checked for**
	 * @param func Function to call
	 * @param config Config to pass to it (type inferred from function)
	 */
	public callCommand<T, U>(func: Command<T, U>, config: T): U {
		if (typeof func.commandInfo === "undefined") {
			throw new Error("Attempted to call a non-command!");
		}
		if (typeof func.commandInfo.commandName !== "string") {
			throw new TypeError("Property commandName was either undefined or not of type string!");
		}
		return func(new this.TwokeysConstructor(func.commandInfo as CommandInfo), config);
	}

	/**
	 * Creates an instance of a Stateful Command (see {@link BaseStatefulCommand}) so we can use it
	 * @param command Command to create instance of
	 */
	public createStatefulCommand<CommandClass extends BaseStatefulCommand>(command: StatefulCommandConstructor<CommandClass>): CommandClass {
		if (typeof command.commandInfo === "undefined") {
			throw new Error("Attempted to call a non-command!");
		}
		if (typeof command.commandInfo.commandName !== "string") {
			throw new TypeError("Property commandName was either undefined or not of type string!");
		}
		return new command(new this.TwokeysConstructor(command.commandInfo));
	}

	/**
	 * (overload) Wraps a stateless command, adding CommandInfo, so it can be used as command.
	 * If this is not done {@link CommandFactory} will throw an error
	 * @param command Command (stateless or stateful) to wrap
	 * @param name Name of command, particularly useful for the logger's prefix
	 */
	/** @template T Command class that is being wrapped (inferred from type of {@link StatefulCommandConstructor}) */
	public static wrapCommand<T extends BaseStatefulCommand>(command: StatefulCommandConstructor<T>, name: string): StatefulCommandConstructor<T>
	/**
	 * Overload for stateful command
	 * @template T Config type for {@link Command}
	 * @template U Return type for {@link Command}
	 */
	public static wrapCommand<T, U>(command: Command<T, U>, name: string): Command<T, U>
	/**
	 * Actual implementation of {@link CommandFactory.wrapCommand}, that takes either a stateful or stateless command and add commandInfo.
	 * 
	 * Generics should be autoinferred by the compiler.
	 * @template T Config type for {@link Command} (only used for stateless commands)
	 * @template U Return type for {@link Command} (only used for stateless commands)
	 * @template V The class that the stateful class constructor will return (only used for stateful commands)
	 */
	public static wrapCommand<T, U, V extends BaseStatefulCommand>(command: Command<T, U> | StatefulCommandConstructor<V>, name: string): Command<T, U> | StatefulCommandConstructor<V> {
		const info: CommandInfo = {
			commandName: name,
		};
		Object.defineProperty(command, "commandInfo", { value: info });
		return command;
	}

	/**
	 * Wraps a stateful command
	 */
	public static wrapStatefulCommand(name: string) {
		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
		return <StatefulCommandClass extends BaseStatefulCommand>(command: StatefulCommandConstructor<StatefulCommandClass>) => CommandFactory.wrapCommand(command, name);
	}
}