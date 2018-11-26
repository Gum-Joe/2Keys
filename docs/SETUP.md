# How to setup 2Keys
This document will guide you through the process of setting up 2Keys

THIS DOCUMENT IS INCOMPLETE.

## Assumptions
- You know how to use command shells (such as CMD, PowerSheel or bash)
- You know how to use a command line interface
- You are familiar with running commands on a raspberry pi (or other linux device) in bash


## Prerequisites
2Keys is divided into 2 parts:

- The server, where hotkeys will be ran
- The detector, which will have the keyboards plugged into it.  It'll detect hotkeys and forward them to the server, where the hotkeys will be ran via [AutoHotkey](https://www.autohotkey.com/)

As such, you'll need:
- A Raspberry Pi Model 2 B or higher (A Model 3 B+ is probably better as it has built in wifi, so a USB doesn't have to be taken up by a dongle.  However, I haven't tested 2Keys on one of them) running Raspian.  This will be the detector.
- A 64-bit Windows PC to act as the server.  Please note 2Keys has only been tested on Windows 10
- The keyboards you want to use with 2Keys, plus USB hubs if required

## 0. Setup
### 0.1 Setting up the server
#### 0.1.1 Assigning a static IP address
#### 0.1.2 Installing Nodejs and setting up build tools 
NOTE: ref NodeJS as node
### 0.2 Setting up the detector
#### 0.2.1 Setting pi-config
#### 0.2.2 Assigning a static IP address
#### 0.2.3 Installing python & pip
## 1. Creating your first 2Keys project (server)
### 1.1 Installing 2Keys on the server
Go to the folder that you want to setup your 2Keys project in, and holding SHIFT right click in an empty space.  Select "Open PowerShell window here" or "Open command window here".

Them run the following command:
```shell
$ npm install -g 2Keys
```
**NOTE:** the `$` at the start is not part of the command, and represents what comes before the command input (i.e. for CMD this could be something like `C:\>`)

This will, using node's built in package manager `npm` download 2Keys from the internet and install it for use via CMD or PowerShell (specified by the `-g` flag).

You can verify 2Keys was installed by running `2Keys --version` which should print the version of 2Keys installed, i.e.:
```shell
$ 2Keys --version
0.3.0
```
### 1.2 Creating your first project
Now it's time to create a 2Keys project! Run the following command:
```
$ 2Keys init
```
Optionally you can run:
```
$ 2Keys init -d path/to/a/folder
```
to setup the project in a folder of your choice.

This command also sets up 2Keys to start at startup for this project.  You can choose not to do this by running:
```
$ 2Keys init --no-startup
```
Note that this will still create files that allow 2Keys to be ran in the background.

<!-- TODO: Add which network to use -->

Answer the questions as they come up. The stuff in brackets after the questions is the default value, which can be used by entering nothing as input.

Once you're done, you can run the 2Keys server by running:
```
$ 2Keys serve
```

<!-- Add OOBE info -->

<!-- TODO: Replace <PLACE> -->
**2Keys sever:** The server that handles execution of hotkeys, by taking requests for which hotkey on which keyboard from the detector.  Later, we'll see how this works in `<PLACE; SECTION>`

### 1.3 The 2Keys daemon
A daemon is a background process, in the case the 2Keys server when running in daemon mode.  I'll be refering to running 2Keys in the background as the 2Keys daemon.
#### 1.3.1 2Keys daemon on startup
As was just mentioned, 2Keys automatically sets itself up for startup, specifically in daemon mode (in the background).  This is done without a command window or anything.  Go to File Explorer and type `shell:startup` into the address bar.  The file `2Keys-Foo.vbs` should be there (assuming you're project is called Foo); this is the file the start the 2Keys daemon.

You can find logs in the `.2Keys` folder in your project root. You'll also see a file called `daemon.vbs`; this is the daemon starter file that was linked to in `shell:startup`.

##### 1.3.1.1 If you ever want to stop 2Keys from starting on startup
<!-- TODO: Add a pic -->
Go into `shell:startup` and delete the `.vbs` file.  This won't remove the daemon itself, but stops it from running on startup.  

It's highly recommended to not delete the `.2Keys` folder in the project root, as otherwise you can never start 2Keys in daemon mode.

##### 1.3.1.2 Readding daemon to startup if you remove it
TODO

#### 1.3.2 How the daemon works
Startup is made up of 3 parts

- `daemon.vbs` (the actual daemon)
- `daemon.js` (a wrapper)
- The 2Keys server, ran by `daemon.js` with `2Keys serve`

`daemon.vbs` starts `daemon.js` using node in cmd, but doesn't show the window (runs in the background).

`daemon.js` is a wrapper around the 2Keys server that is ran by `daemon.vbs` that handles logging and management of the daemon

The 2Keys server is the actual server that handles hotkey execution.

### 1.3.3 Daemon logs
The 2Keys daemon stores logs in the `.2Keys` project root. 
You may notice more verbose output in the logs.  To achieve this directly running `2Keys serve`, set the environment variable in your sheel `DEBUG` to `*` (this differs for each shell, so i'm not going to try to explain it here.)

### 1.3.3 Daemon commands
You can manually control the daemon using `2Keys`.  In the project root, you can use these commands:

To start the daemon:
```
$ 2Keys start
```

To stop it:
```
$ 2Keys stop
```

To restart it:
```
$ 2Keys restart
```

#### 1.4 If you can't restart the process
The 2Keys daemon sometimes doesn't stop correctly (see #12).

If you end up like this:
(Use taskmanager to terminate it, TODO as needs pics).
## 2. Adding your detector
### 2.1 Installing 2Keys on the detector
Simple run, via SSH:
```
$ sudo pip3 install 2Keys
```

This will install 2Keys using python's package manager, `pip` for use with python 3.  It will also add 2Keys to the command line.

You can verify 2Keys was installed by running `2Keys --version` which should print the version of 2Keys installed, i.e.:
```shell
$ 2Keys --version
0.3.0
```
### 2.2 Adding your project
First, make sure the 2Keys server is running.  Then, create a new directory to store you project in in a location of your choice (`mkdir path/to/dir`)

Then, run:
```
$ 2Keys init
```

Answer the questions as they come up, supplying the same values for port and IP Address as you did in 1.

You can see your 2Keys project is setup by running:
```
$ ls
```
Output:
```
config.yml
```

You can watch a keyboard and start watching for hotkeys and sending them to the server with:
```
$ 2Keys watch keyboard
```
Where `keyboard` is the keyboard name in the config.
### 2.2.1 Config changes
If you make a config change on the server, sync it to the pi using:
```
$ 2Keys sync
```
DON'T update the config directly on the Pi, as it will be overwritten at the next sync.
### 2.3 Starting 2Keys on startup (detector)
On the detector we can't automatically add 2Keys to startup, as such you'll need to run the following command:
```
$ sudo bash ./.2Keys/register.sh
```
This adds a systemd script for each keyboard (found in `.2Keys` on the detector) that start 2Keys when the detector starts.

#### 2.3.1 Additional commands
`register.sh` has some useful commands.  Run `sudo bash ./.2Keys/register.sh help` for information.

#### 2.3.2 Notes
2Keys will effectively lock the keyboard it's watching, which means only 2Keys can use it.  This is so you don't accidentally type things into the detector (i.e. accidentally running commands in a terminal) and there is no escape key from this (see #6).

## 3. Writing hotkeys
Ok, so your 2Keys project is now setup, time to write some hotkeys
### 3.1 How 2Keys works
2Keys works like so:

1. Detector watches and keeps track of keys pressed, and when a combi matches a hotkey it sends a request to the server telling it which keyboard the press was on and which hotkey to fire.
2. Server recieves this request and directly links to AutoHotkey and runs the follwing:
```autohotkey
#Include path/to/root.ahk ; I.e keyboard_1/index.ahk
MyFunction() ; The function you want to execute that runs the macro/hotkey
```

As such, your macros must exist as functions.

Go ahead and open the `index.ahk` in one of your keyboard dirs that you setup in 1.  For simplicity, i'm going to assume the keyboard dir and name is `keyboard_1`.  Read what's written there.

### 3.1 Your first hotkey
### 3.2 How to make hotkey changes
### 3.3 Workaround so you don't have to rewrite scripts in AutoHotkey v2
### 3.4 Helpers
