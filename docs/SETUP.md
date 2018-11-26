# How to setup 2Keys
This document will guide you through the process of setting up 2Keys

THIS DOCUMENT IS INCOMPLETE.

## Prerequisites
2Keys is divded into 2 parts:

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

##### 1.3.1.1 If you ever want to stop 2Keys on startup
<!-- TODO: Add a pic -->
Go into `shell:startup` and delete the `.vbs` file.  This won't remove the daemon itself, but stops it from running on startup.  

It's highly recommended to not delete the `.2Keys` folder in the project root, as otherwise you can never start 2Keys in daemon mode.

##### 1.3.1.2 Adding daemon to startup if you remove it
TODO

#### 1.3.2 How the daemon works
Startup is made up of 3 parts

- `daemon.vbs` (the actual daemon)
- `daemon.js` (a wrapper)
- The 2Keys server, ran by `daemon.js` with `2Keys serve`

`daemon.vbs` starts `daemon.js` using node in cmd, but doesn't show the window (runs in the background).

`daemon.js` is a wrapper around the 2Keys server that is ran by `daemon.vbs` that handles logging and management of the daemon

The 2Keys server is the actual server that handles hotkey execution.

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
## 2. Adding your detector
### 2.1 Installing 2Keys on the detector
### 2.2 Adding your project
### 2.3 Starting 2Keys on startup (detector)
## 3. Writing hotkeys
### 3.1 Your first hotkey
### 3.2 How to make hotkey changes
### 3.3 Workaround so you don't have to rewrite scripts in AutoHotkey v2
### 3.4 Helpers
