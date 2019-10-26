# How to add keyboards
This document goes through how to add more keyboards to your 2Keys install

## 1. How 2Keys manages keyboards
2Keys manages your keyboards via the config file, which is stored on both the server and detector.
A section from the example config [https://github.com/Gum-Joe/2Keys/blob/master/docs/config_example.yml](https://github.com/Gum-Joe/2Keys/blob/master/docs/config_example.yml) is below, with annotations:
```yml
# The below section contains all the info about the keyboards, including hotkeys
keyboards:
  # Each YAML entry key (NOT keybaord key) here corresponds to the name of the keyboard that 2Keys uses
  Keyboard_1: # So this keyboard is called "Keyboard_1"
    path: /dev/input/by-id/usb-04d9_1203-event-kbd # The path on the detector that is watched to detect keystrokes
    dir: ./Keyboard_1 # Root directory with all hotkeys related to this keyboard in
    root: index.ahk # Root file in the directory specified above, which all hotkeys are imported to. Is loaded before execting a hotkey function
    hotkeys: # Hotkeys!
      A: MsgBox # Just specify the name of a function to use when executing hotkeys
	
  Keyboard_2:
    path: /dev/input/by-id/xyz-etc-usw # See above for annotation on meaning
    dir: ./Keyboard_2 # See above for annotation on meaning
    hotkeys:
      A: DoAFunc # Function name
      # Rest of of them truncated
```

For those who know TypeScript, the TS interfaces defining the config are found at [https://github.com/Gum-Joe/2Keys/blob/master/server/src/util/interfaces.ts](https://github.com/Gum-Joe/2Keys/blob/master/server/src/util/interfaces.ts)

## 2. Adding new keyboards
As you can see, if you wish to add a new keyboard you'll need to replicate thje individual keyboard config above.  Thankfully, 2Keys can do this for you.
(**NB:** CLI adding is currently implmented on the detector only)

### 2.1 The server
Before you do anything, make sure you have terminated the 2Keys server daemon. (see SETUP.md sections 1.3.3 & 1.3.4).

Open your 2Keys config file and add this as part of the `keyboards` section:
(please make sure to read the comments in it)

```yml
Keyboard_3: # Change this for a name you want to use
	path: TO GET
	dir: ./Keyboard_1 # Change this to what you want to use (reccomendation: use the name of the keybaord)
	root: index.ahk # You should probable leave this as index.ahk
	hotkeys:
		# Add any hotkeys you want to add below
		A: MsgBox # This is an example.  Feel free to remove it.
```

Make sure to create the keyboard's root directory (in the above example, `./Keyboard_3`) and root file you specified (in the above example, `index.ahk`) in the keyboard's root directory.

Once you are done, start the 2Keys server daemon again (see SETUP.md section 1.3.3).

### 2.2 The detector
SSH into your Raspberry Pi and `cd` to the directory where the 2Keys config files are stored.

2. Sync the config: `2Keys sync`
2. Run `2Keys add <name of keyboard used above>` (in the example above, the command becomes `2Keys add Keyboard_3`)
3. Restart the detector daemon with `sudo bash ./.2Keys/register.sh restart`
4. Done! The keybaord should now act as a macro keyboard and hotkeys should execute.
