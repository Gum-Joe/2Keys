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

## Sofware used & inspiration
To block keystrokes from the second keyboard: [Interception](https://github.com/oblitum/Interception), found in `./interception`

Inspired by LTT editor Taran's second keyboard project: [https://github.com/TaranVH/2nd-keyboard](https://github.com/TaranVH/2nd-keyboard)