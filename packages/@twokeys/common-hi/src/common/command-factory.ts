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
 * Class used to call commands
 * @packageDocumentation
 */

import { FinalTwoKeysConstructor } from "./twokeys";
import { Command, CommandInfo, BaseStatefulCommand, StatefulCommandConstructor } from "./base-commands";
import { TwoKeysProperties } from "@twokeys/core/src";
import { checkCommandInfo } from "./is-command";

/**
 * Provides the needed methods to call commands,
 * allowing commands to be called without having to create a instance of TwoKeys manually every time.
 * 
 * @param TwokeysConstructor The TwoKeys class to use when calling commands
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

	constructor(public TwokeysConstructor: FinalTwoKeysConstructor) {}

	/**
	 * Calls a stateless command (that has been wrapped with {@link CommandFactory.wrapCommand})
	 * 
	 * **Note: Make sure all properties in {@link CommandInfo} are checked for.  This is because we can't guarentee {@link CommandFactory.wrapCommand} has been called**
	 * @param func Function to call
	 * @param config Config to pass to it (type inferred from function)
	 */
	public callCommand<T, U>(func: Command<T, U>, config: T, properties: TwoKeysProperties = {}): U {
		checkCommandInfo(func);
		return func(new this.TwokeysConstructor(func.commandInfo as CommandInfo, properties), config);
	}

	/**
	 * Creates an instance of a Stateful Command (see {@link BaseStatefulCommand}) so we can use it
	 * 
	 * **Note: Make sure all properties in {@link CommandInfo} are checked for.  This is because we can't guarentee {@link CommandFactory.wrapStatefulCommand} has been called**
	 * @param command Command to create instance of
	 */
	public createStatefulCommand<CommandClass extends BaseStatefulCommand>(command: StatefulCommandConstructor<CommandClass>, properties: TwoKeysProperties = {}): CommandClass {
		checkCommandInfo(command);
		return new command(new this.TwokeysConstructor(command.commandInfo, properties));
	}

	/**
	 * (overload) Wraps a stateful command, adding CommandInfo, so it can be used as command.
	 * If this is not done {@link CommandFactory} will throw an error.
	 * 
	 * This function is used internally by {@link CommandFactory.wrapStatefulCommand} - use {@link CommandFactory.wrapStatefulCommand} instead as a decorator when wrapping stateful commands
	 * @param command Command (stateful) to wrap
	 * @param name Name of command, particularly useful for the logger's prefix
	 * @template T Command class that is being wrapped (inferred from type of {@link StatefulCommandConstructor})
	 * @private
	 */
	public static wrapCommand<T extends BaseStatefulCommand>(command: StatefulCommandConstructor<T>, name: string): StatefulCommandConstructor<T>
	/**
	 * Overload for stateless commands - wraps a stateless command so it can be used as a command, adding commandInfo ({@link CommandInfo})
	 * @template T Config type for {@link Command}
	 * @template U Return type for {@link Command}
	 * @public
	 */
	public static wrapCommand<T, U>(command: Command<T, U>, name: string): Command<T, U>
	/**
	 * Actual implementation of {@link CommandFactory.wrapCommand}, that takes either a stateful or stateless command and add commandInfo, so it can be used as a command.
	 * 
	 * Please only call this with stateless commands; use {@link CommandFactory.wrapStatefulCommand} as a decorator for stateful commands (it uses this function internally)
	 * 
	 * Generics should be autoinferred by the compiler.
	 * @template T Config type for {@link Command} (only used for stateless commands)
	 * @template U Return type for {@link Command} (only used for stateless commands)
	 * @template V The class that the stateful class constructor will return (only used for stateful commands)
	 * @public
	 */
	public static wrapCommand<T, U, V extends BaseStatefulCommand>(command: Command<T, U> | StatefulCommandConstructor<V>, name: string): Command<T, U> | StatefulCommandConstructor<V> {
		const info: CommandInfo = {
			commandName: name,
		};
		Object.defineProperty(command, "commandInfo", { value: info });
		return command;
	}

	/**
	 * Wraps a stateful command using {@link CommandFactory.wrapCommand}.
	 * 
	 * Usage:
	 * @example
	 * ```typescript
	 * @CommandFactory.wrapStatefulCommand("bob")
	 * class ACommandCalledBob extends BaseStatefulCommand {
	 * 	public run(config: any) { // Please specifiy an actual config type
	 * 		// Some run body
	 * 	}
	 * }
	 * ```
	 */
	public static wrapStatefulCommand(name: string) {
		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
		return <StatefulCommandClass extends BaseStatefulCommand>(command: StatefulCommandConstructor<StatefulCommandClass>) => CommandFactory.wrapCommand(command, name);
	}
}