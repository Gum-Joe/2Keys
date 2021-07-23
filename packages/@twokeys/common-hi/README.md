# @twokeys/common-hi
Encompasses things shared by the GUI and CLI, such as interfaces defining Setup UI, as well as the code for these.

**NB:** Use proto2 syntax for protobufs, as otherwise the compiled types will all be optional

File structure:
```
src
|- common
   |- base-commands.ts: Contains the base, abstract class that all commands extend, as well as the types for stateless commands.
   |- command-factory.ts: Class used to call commands
   |- twokeys.ts: Defines types for the TwoKeys class that commands should use.
   |- index.ts: Exports everything for commin
|- setup
   |- common
      |- commands
         |- install.ts
      |- interfaces.ts (maybe split into separate files?)
   |- oobe
      |- commands
         |- create-config.ts
      |- layouts
         |- welcome.ts
   |- same as oobe folder for setup-(detector, project, add-detector, keyboard) 
|- each command then has it's won folder, e.g.:
|- sync (detector config syncing code)
```

Note: I've decided not to export everything in `src/index.ts`, given how much is in this `src`; please require directories directly.

## Information about commands (from `src/common/base-commands.ts`)
### What is a command?
A command is essentially a piece of logic, that is shared by both the CLI and GUI, that does something.
It is not neccesarily related to CLI commands.

#### Commands can be either stateful or stateless:
- Stateless commands are capable of storing information and having a state, for example, holding a file in memory whilst the command is in use,
	rather than loading it every time the command is called.  A more practical example in 2Keys is the sync command can maintain an SSH session to detectors
	if implemented as a stateful command.  Stateful commands should be defined as classes, that extend this class
- Stateless commands are commands that are ran as a one off, where all the info needed is (ideally) provided via function arguments.  These should be defined as functions.

#### Examples of commands in 2Keys include:
- Syncronising detector and server config
- The install code that is used to show a running task with progress and console output,
	usually for e.g. installing add-ons or software
- Commands to handle config creation

### Rules (for stateful commands)
Command should be:
- Small & modular: there should not be too much logic dedicated to one command;
	if there is lots of logic, consider splitting it into more than 1 command.
- Command should be invokable by other commands.
- assumptionless: commands should make no assumption about the environment they are ran under,
	including (but not limited to) e.g. CWDs, locations of important files, etc
	- And extension of this is that commands should be atomic, that is, isolated from other operations.  However, for e.g. writing to a DB, this may not be possible

For a complete example, see `test/common/example.ts` (NOTE: If this file does not compile, the code is broken (think of this file as a test)).

### Testing notes
Some commands make changes to the system.  These should be ran in containers, and you can run them by using the `test:isolated` script.
- For IPv4 setting tests, also set the env var `TWOKEYS_OOBE_NET_TEST_INTERFACE` to the network interface to change the IP address of.