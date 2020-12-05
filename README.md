# 2Keys [![Build Status](https://travis-ci.com/Gum-Joe/2Keys.svg?branch=v1)](https://travis-ci.com/Gum-Joe/2Keys) [![codecov](https://codecov.io/gh/Gum-Joe/2Keys/branch/v1/graph/badge.svg)](https://codecov.io/gh/Gum-Joe/2Keys) [![Maintainability](https://api.codeclimate.com/v1/badges/5ac4148c6d32ed9fbbab/maintainability)](https://codeclimate.com/github/Gum-Joe/2Keys/maintainability)


A easy to setup second keyboard, designed for everyone.

For a full setup guide, see [here](https://github.com/Gum-Joe/2Keys/blob/v1/docs/SETUP.md)

For keyboard mappings, see [here](https://github.com/Gum-Joe/2Keys/blob/v1/docs/MAPPINGS.md)

### DEVELOPMENT NOTICE
I'm now working on a new version of 2Keys that is more modular & will be designed for the upcoming 2Keys Studio GUI.
Please see the `v1` branch.

### Support
Windows is supported only as the server (where the hotkeys will run) and a raspberry pi is required to run the detector.

## WARNING
This will download a copy of [AutoHotkey_H](https://hotkeyit.github.io/v2/), a DLL version of [AutoHotkey](http://autohotkey.com/)

## Building
~~To build & install the server, where hotkeys are run (for development purposes):~~
```
# IGNORE
$ yarn
$ yarn build
$ yarn link
```

To build all packages:
```shell
$ yarn
$ yarn wsrun -mtc precompile # compiles protobuf definiton files
$ yarn build # use yarn build -v to display more detailed output -> this builds the TS files
```

To test everything:
```shell
$ yarn workspace @twokeys/server run ts-node ./scripts/bootstrap.ts --debug # Downloads AHK for testing
$ yarn test:all # use yarn coverage:all for coverage
```

To test packages one by one:
```shell
$ yarn workspace @twokeys/server run ts-node ./scripts/bootstrap.ts --debug # Downloads AHK for testing
$ yarn workspaces run test
```

To build the detector (after installing [Pipenv](https://github.com/pypa/pipenv)) (for development purposes):
```
$ cd detectors/detector-pi/detector
$ pipenv install
$ pipenv shell
```
You can then install it in the Pipenv shell's PATH with `pip link -e .`

If you want to install it globally, so you can use it with the 2Keys `systemctl` services:
```
$ cd detectors/detector-pi/detector
$ pipenv lock -r > required_tmp.txt
$ pip3 install -r required_tmp.txt
$ pip3 link -e .
```
Note that with this 2Keys and its dependencies will be installed for the entire system.

## Devices
**Server**: The device running the hotkeys sever, i.e. where the hot keys will be run

**Detecter**: Device that handles detection of key presses & which keyboard it is and sends this to the server


## Sofware used & inspiration
Inspired by LTT editor Taran's second keyboard project: [https://github.com/TaranVH/2nd-keyboard](https://github.com/TaranVH/2nd-keyboard)

2Keys uses AutoHotkey_H (a DLL version of AutoHotkey): [https://hotkeyit.github.io/v2/](https://hotkeyit.github.io/v2/)

## License
Copyright 2020 Kishan Sambhi

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
