# 2Keys
A easy to setup second keyboard, designed for everyone.

### Support
Only Windows is supported, though you might be able to get this working with `Wine`

## WARNING
This will install the [Interception](https://github.com/oblitum/Interception) drivers on your PC, as well as downloading [AutoHotkey](https://github.com/AutoHotkey/)

## Building
To build the jar:
`./gradlew build`

To package the jar for publishing:
`./gradlew shadowJar`

To build the C++ library for [Interception](https://github.com/oblitum/Interception):
`./gradlew mainSharedLibrary`

## Devices
**Server**: The device running the hot keys sever, i.e. where the hot keys will be run
**Handler**: Device that handles keyboard presses and sends them to the Server
**Detecter**: Device that handles detection of key presses & which keyboard it is

## Sofware used & inspiration
To block keystrokes from the second keyboard: [Interception](https://github.com/oblitum/Interception), found in `./lib/interception`

Inspired by LTT editor Taran's second keyboard project: [https://github.com/TaranVH/2nd-keyboard](https://github.com/TaranVH/2nd-keyboard)

To detect the keyboard being used: [https://www.codeproject.com/Articles/17123/Using-Raw-Input-from-C-to-handle-multiple-keyboard](https://www.codeproject.com/Articles/17123/Using-Raw-Input-from-C-to-handle-multiple-keyboard) (code downloaded).  Licensed under `LGPL3`, code has been modified to work for 2Keys.  Found in `./lib/rawinput`