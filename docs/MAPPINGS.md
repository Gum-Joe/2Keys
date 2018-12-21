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
| <         | Left key (i.e. left control (`<^`), left shift (`<+`))                                                                           |
| >         | Right key (i.e. right control (`^>`), right Alt/AltGr (`!>`))                                                                    |
| #         |                                                                                                                                  |
| $key$     | Used to denote special keys, such as UP, DOWN, RIGHT, LEFT arrow keys; CAPS (Caps Lock), TAB. Replace key with key name in caps  |
| character | Used for all keys that are one character, except one's in table below (i.e. numpad)                                              |

## Table of keys
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
| $NUM1-9$     | Numpad numbers                               |       |
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