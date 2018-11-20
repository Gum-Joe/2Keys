# 2Keys
A easy to setup second keyboard, designed for everyone.

### Support
Windows is supported only as the server (where thje hotkeys will run) and a raspberry pi is required to run the detector

## WARNING
This will download a copy of [AutoHotkey_H](https://hotkeyit.github.io/v2/), a DLL version of [AutoHotkey](http://autohotkey.com/)

## Building
To build the jar:
`./gradlew build`

To package the jar for publishing:
`./gradlew shadowJar`

## Devices
**Server**: The device running the hot keys sever, i.e. where the hot keys will be run

**Detecter**: Device that handles detection of key presses & which keyboard it is and sends this to the server

## Config notes
Symbols, based of AHK:


| Symbol |                                                                                                                                  |
|--------|----------------------------------------------------------------------------------------------------------------------------------|
| !      | Alt                                                                                                                              |
| ^      | Control                                                                                                                          |
|  +     | Shift                                                                                                                            |
| <      | Left key (i.e. left control (`<^`), left shift (`<+`))                                                                           |
| >      | Right key (i.e. right control (`^>`), right Alt/AltGr (`!>`))                                                                    |
| #      |                                                                                                                                  |
| $key$  | Used to denote special keys, such as UP, DOWN, RIGHT, LEFT arrow keys; CAPS (Caps Lock), TAB. Replace key with key name in caps  |


NOTE: Slash issues.  Key 127 is useful as a mode key.  DO NOT BLOCK 99. 125 and 126 are Windows Keys

The following keys are not blocked by 2Keys, but can still be remapped:

- SysReq key, so you can recover the system
- Power key so you can power the system down


## Sofware used & inspiration
Inspired by LTT editor Taran's second keyboard project: [https://github.com/TaranVH/2nd-keyboard](https://github.com/TaranVH/2nd-keyboard)
Uses AutoHotkey_H (a DLL version of AutoHotkey): [https://hotkeyit.github.io/v2/][https://hotkeyit.github.io/v2/]

## License
Copyright 2018 Kishan Sambhi

2Keys is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

2Keys is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.