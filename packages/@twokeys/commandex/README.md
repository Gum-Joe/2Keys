# @twokeys/commandex
Commandex is the package that helps us share logic between CLI and GUI.

It works through the use of a compiler, which take commands (which are discrete units of logic) and create a single class, called a command factory, which allows easy access to these commands without having to provide a twokeys object every time