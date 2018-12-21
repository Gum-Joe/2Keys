# 2Keys
A easy to setup second keyboard, designed for everyone.

For a full setup guide, see [here](https://github.com/Gum-Joe/2Keys/blob/master/docs/SETUP.md)

For keyboard mappings, see [here](https://github.com/Gum-Joe/2Keys/blob/master/docs/MAPPINGS.md)

### Support
Windows is supported only as the server (where the hotkeys will run) and a raspberry pi is required to run the detector.

## WARNING
This will download a copy of [AutoHotkey_H](https://hotkeyit.github.io/v2/), a DLL version of [AutoHotkey](http://autohotkey.com/)

## Building
To build the server, where hotkeys are run:
```
$ cd server
$ yarn
```

To build the detector:
```
$ cd detector
$ pip3 install -r required.txt
```

## Devices
**Server**: The device running the hotkeys sever, i.e. where the hot keys will be run

**Detecter**: Device that handles detection of key presses & which keyboard it is and sends this to the server


## Sofware used & inspiration
Inspired by LTT editor Taran's second keyboard project: [https://github.com/TaranVH/2nd-keyboard](https://github.com/TaranVH/2nd-keyboard)

2Keys uses AutoHotkey_H (a DLL version of AutoHotkey): [https://hotkeyit.github.io/v2/](https://hotkeyit.github.io/v2/)

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