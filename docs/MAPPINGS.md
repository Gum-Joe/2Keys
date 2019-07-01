# Mappings
This file contains the key code for keys to use with 2Keys.  These go in the `hotkeys` section in each keyboard.  I.e:
```yml
keyboards:
  keyboard_1:
    hotkeys:
      ^A: HelloWorld # ^A means fire this hotkey when control + A is pushed
```

## Table of modifiers
| Symbol    |                                                                                                                                  |
|-----------|----------------------------------------------------------------------------------------------------------------------------------|
| !         | Alt                                                                                                                              |
| ^         | Control                                                                                                                          |
|  +        | Shift                                                                                                                            |
| #         | Windows key                                                                                                                      |
| <         | Left key (i.e. left control (`<^`), left shift (`<+`))                                                                           |
| >         | Right key (i.e. right control (`^>`), right Alt/AltGr (`!>`))                                                                    |
| $key$     | Used to denote special keys, such as UP, DOWN, RIGHT, LEFT arrow keys; CAPS (Caps Lock), TAB. Replace key with key name in caps  |
| character | Used for all keys that are one character, except one's in table below (i.e. numpad)                                              |

## Table of keys

1. SSH into the detector.
2. `cd` to where your 2Keys project is stored.
3. Run `sudo bash ./.2Keys/register.sh stop` to stop the server.
4. Run `2Keys watch <keyboard_name>`, replacing `<keyboard_name>` with the keyboard the key is on.
5. Press the key and see what mapping comes up, if any.  See below if the mapping is blank.
6. Restart the server with `sudo bash ./.2Keys/register.sh start` once you're done.

If no mapping comes up, note down the key code and add the following to config, under the keyboard with the key on:
```yml
keyboard:
  keyboard_1: # Assuming that is the name
    map:
      C1: key_code # Note that C1 can be whatever you want it to be.
      # I.e.:
      C2: 42
```

You can now use this key by wrapping the value you set (i.e. `C1`) in brackets:
```yml
keyboard:
  keyboard_1: # Assuming that is the name
    hotkeys:
      (C1): HelloWorld
```

| Symbol       | Corresponding Key                            | Notes |
|--------------|----------------------------------------------|-------|
| $NUM_*$      | Numpad asterisk                              |       |
| $SPACE$      | Spacebar                                     |       |
| $BACKSPACE$  | Backspace                                    |       |
| $TAB$        | Tab                                          |       |
| $CAPS$       | Caps lock                                    |       |
| F1-F24       | Function keys, $ not required                |       |
| $ENTER$      | Enter                                        |       |
| $NUMLOCK$    | Numlock                                      |       |
| $SCROLLLOCK$ | Scrol Lock                                   |       |
| NUM1-9       | Numpad numbers                               |       |
| $NUM_-$      | Numpad negative                              |       |
| $NUM_+$      | Numpad plus                                  |       |
| $NUM_.$      | Numpad full stop                             |       |
| $#$          | The extra key on UK keyboard with ~ and # on |       |
| $NUM_ENTER$  | Enter key on numpad                          |       |
| $NUM_/$      | Slash key on numpad                          |       |
| $PRINT_SCR$  | Print screen/SysReq key                      |       |
| $HOME$       | Home key                                     |       |
| $UP$         | Arrow Up key                                 |       |
| $PAGE_UP$    | Page Up key                                  |       |
| $LEFT$       | Left Arrow key                               |       |
| $RIGHT$      | Right arrow key                              |       |
| $END$        | End key                                      |       |
| $DOWN$       | Down arrow key                               |       |
| $PAGE_DOWN$  | Page down key                                |       |
| $INSERT$     | Insert key                                   |       |
| $DELETE$     | Delete key                                   |       |
| $NUM_=$      | Numpad equals                                |       |
| $PAUSE$      | Pause key (not symbol pause, word Pause)     |       |
| $NUM_,$      | Numpad comma                                 |       |
