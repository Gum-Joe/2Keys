# How to setup 2Keys
This document will guide you through the process of setting up 2Keys.

Please note raspberry pi and detector are used interchangeably.


## Prerequisites
2Keys is divided into 2 parts:

- The server, where hotkeys will be run
- The detector, which will have the keyboards plugged into it.  It'll detect keypresses and forward them to the server, where the hotkeys will be run via [AutoHotkey](https://www.autohotkey.com/)

As such, you'll need:
- A Raspberry Pi Model 2 B or higher (A Model 3 B+ is probably better as it has built-in wifi, so a USB port doesn't have to be taken up by a dongle.  However, I haven't tested 2Keys on one of them) running Raspian.  This will be the detector.
- A 64-bit Windows PC to act as the server.  Please note 2Keys has only been tested on Windows 10
- The keyboards you want to use with 2Keys, plus USB hubs if required

## 0. Setup
### 0.1 Setting up the server
#### 0.1.1 Assigning a static IP address
##### 0.1.1.1 Why?
When you connect to a network, the router automatically assigns an IP address (a way of a router knowing where to send data) to your computer.  2Keys uses this to identify which device the server (the part where hotkeys are executed) is and to send requests to it.  Unfortunately, these addresses usually change, meaning the config on the detector would have to be updated everytime your IP address changed.  As such, we're going to set a special type of IP address, called a static IP address.

##### 0.1.1.2 Select an adapter
On Windows 10: `Settings > Network and Internet > Change Connection Properties`

On Windows 8.1 or lower: `Control Panel > Network and Internet > Network and Sharing Centre > Change Adapter Settings`

Find the adapter corresponding to your internet connection.  For me this is the `Network Bridge`, for you it may be one labelled Ethernet.  Ignore anywhere the 3rd line is something like `Hyper-V` or `Virtual Box`.  Right-click the adapter and select `Properties`.  You should see something like this:

![https://raw.githubusercontent.com/Gum-Joe/2Keys/master/docs/Adapter.png](https://raw.githubusercontent.com/Gum-Joe/2Keys/master/docs/Adapter.png)

Highlight `Internet Protocol Version 4 (TCP/IPv4)` and select properties.  Then select `Use the following IP address`.

### 0.1.1.3 Select an IP
Now open a command prompt admin windows (search for `cmd` then right click and select `Run as Administrator`) and run `ipconfig`.  Find the network adapter you selected in 0.1.1.2 and copy the IPv4 address and subnet mask into their corresponding fields in the properties window you opened at the end of 0.1.1.2.

Then click `OK` then `OK` again then close the properties window, control panel and command prompt window.

#### 0.1.2 Installing Nodejs and setting up build tools 
In order to use 2Keys, you'll need [NodeJS](https://nodejs.org/en/).  Make sure to download the LTS release (at the time of writing `10.x.x`).
Download the installer from the site and run it.  During install don't tick the box to automatically install the tools for native modules (see below); we'll use a Microsoft provided tool for that.

Once installed, go to the directory you want to install 2Keys in and then go File > Open Windows Powershell/Command Prompt as Administrator.  If you're running Windows 7 or below, search for `cmd` in the start menu, right click `cmd.exe` and then select `Run as Administrator`

Once inside, run `npm install --global windows-build-tools`.  This will install a Microsoft provided tool to install dependencies to build native addons.  Native addons are bits of code not written in JavaScript (what NodeJS runs), such as code that interfaces with Windows functions (i.e. opening a DLL).  2Keys uses native modules for its executor of AutoHotkey code, by using a special version of AutoHotkey, [AutoHotkey_H](https://hotkeyit.github.io/v2/), that provides a DLL version of AutoHotkey that 2Keys can interface with.

#### 0.1.3 Installing Git Bash
For this tutorial, you'll need `ssh` (I'll explain what this is in 0.2.1).  This can be found with Git Bash for Windows. Go to [https://git-scm.com/downloads](https://git-scm.com/downloads) and download the latest release.  During install ensure that you select the option to add the tools to `PATH`.
### 0.2 Setting up the detector
Please note it's assumed you've already installed Raspian and set it up (i.e. running `sudo apt update` and `sudo apt upgrade`) (By the way `apt` is just a better version of `apt-get`).

There are tutorials on this out on the web.

#### 0.2.1 Setting pi-config
If you already know how to use pi-config, just ensure SSH is enabled and that auto-login to the desktop is enabled.  If you don't know how to do any of those, follow below, else, skip to 0.2.2

These steps should be carried out on the raspberry pi's GUI (i.e. with it plugged into a screen), instead of via SSH (we'll get to what that is soon).

**Wait, what's SSH?** SSH (Secure Shell) is a secure way for us to remotely open a command shell on a different machine, in this case the raspberry pi, and access it from our PC.  It's useful as it means we can still use our main computer whilst running a task on the raspberry pi (or any other machine with SSH)

1. Open pi config by running `sudo raspi-config`.  Use the arrow keys to change the highlighted option and enter to select the highlighted option.
2. Select `Interfacing Options`
3. Select `SSH`
4. Select `Yes`
5. Hit enter once done
6. It's also highly advised now to change the default password.  Select `Change User Password` and follow the onscreen instructions to enter a new password (`Enter new UNIX password:`).  Note that the lack of anything showing what you're typing (or if you're typing at all) is purposeful.
8. Now set statup options.  Select `Boot Options` then `Desktop/CLI` then `Desktop Autologin`
7. Now just select finish.

**DO NOT REBOOT THE RASPBERRY PI JUST YET.** We are first going to setup a static IP address for the raspberry pi

#### 0.2.2 Assigning a static IP address
##### 0.2.2.1 Find current settings
Run `ip route | grep default`.  Copy down the first IP address shown, this is the default gateway.

Run `ip route | grep wlan0` if using wireless networking or `ip route | grep eth0` if using ethernet.  Copy down the IP address shown at the start of the line shown, including the `/xx` part.   This is what we will set as your IP address.

##### 0.2.2.2 Set settings
Run `sudo nano /etc/dhcpcd.conf` to open an editor
At the bottom of the file, add this (pay attention to the comments, text starting with `#`):
```conf
interface wlan0 # Replace wlan0 with eth0 if using ethernet

static routers=192.168.0.1 # Replace with what you got for the default gateway
static ip_address=192.168.0.2/24 # Replace with the other IP you got in 0.2.2.1
static domain_name_servers=1.1.1.1 1.0.0.1 192.168.0.1 # Replace the last IP address with the default gateway.  The 2 address before is Cloudflare's DNS.
```

Now reboot your raspberry pi with `sudo reboot`

#### 0.2.3 SSH
Now we can SSH into the raspberry pi.  Open a Git Bash window and type `ssh pi@0.0.0.0`, replacing `0.0.0.0` with the IP you set in 0.2.2.2, minus the `/xx` bit.  Enter your password when prompted.

From now on i'll assume you'll run commands on the raspberry pi through SSH.

#### 0.2.3 Installing python & pip
##### 0.2.3.1 Do you already have it?
Run these commands on the detector:
```
$ python3 --version
$ python3 -m pip --version
$ pip3 --version
```

**NOTE:** the `$` at the start is not part of the command, and represents what comes before the command input (i.e. for CMD this could be something like `C:\>`)

If all commands work skip this section.

If only the last command returns with a command not found, when you see `pip3` use `python3 -m pip` instead and skip this section

If command 2 fails but command 3 does not, you can safely skip this section.

Else, follow along with this section.

##### 0.2.3.2 Install python 3 and pip for python3
Run:
```
$ sudo apt update
$ sudo apt install python3 python3-pip
```

Use the commands in 0.2.3.1 to verify you have `python3` and `pip3`

## 1. Creating your first 2Keys project (server)
### 1.1 Installing 2Keys on the server
Go to the folder that you want to setup your 2Keys project in, and holding SHIFT right-click in an empty space.  Select "Open PowerShell window here" or "Open command window here".

Then run the following command:
```shell
$ npm install --global twokeys-server
```

This will, using node's built-in package manager `npm`, download 2Keys from the internet and install it for use via CMD or PowerShell (specified by the `--global` flag).

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
Note that this will still create files that allow 2Keys to be run in the background.


Answer the questions as they come up. The stuff in brackets after the questions is the default value, which can be used by entering nothing as input.

When asked which IP address to select, select the IP/network that corresponds to the static IP you set in 0.1.1.

Once you're done, you can run the 2Keys server by running:
```
$ 2Keys serve
```

<!-- Add OOBE info -->

<!-- TODO: Replace <PLACE> -->
**2Keys sever:** The server that handles execution of hotkeys, by taking requests for which hotkey on which keyboard from the detector.  Later, we'll see how this works in 3.1.

### 1.3 The 2Keys daemon
A daemon is a background process, in the case the 2Keys server when running in daemon mode.  I'll be referring to running 2Keys in the background as the 2Keys daemon.
#### 1.3.1 2Keys daemon on startup
As was just mentioned, 2Keys automatically sets itself up for startup, specifically in daemon mode (in the background).  This is done without a command window or anything.  Go to File Explorer and type `shell:startup` into the address bar.  The file `2Keys-Foo.vbs` should be there (assuming you're project is called Foo); this is the file the start the 2Keys daemon.

You can find logs in the `.2Keys` folder in your project root. You'll also see a file called `daemon.vbs`; this is the daemon starter file that was linked to in `shell:startup`.

##### 1.3.1.1 If you ever want to stop 2Keys from starting on startup
Go into `shell:startup` (by typing it into Windows Explorer's address bar) and delete the `.vbs` file.  This won't remove the daemon itself, but stops it from running on startup.

![https://raw.githubusercontent.com/Gum-Joe/2Keys/master/docs/Startup.png](https://raw.githubusercontent.com/Gum-Joe/2Keys/master/docs/Startup.png)

**Note:** Where `KeyboardOfMacros` is will be the name of the 2Keys project.

It's highly recommended to not delete the `.2Keys` folder in the project root, as otherwise, you can never start 2Keys in daemon mode.

##### 1.3.1.2 Re-adding daemon to startup if you remove it
TODO.  Not necessary for the first release, may be added as a feature later.
The simple answer is to create a shortcut to `.2Keys/daemon.vbs` in `shell:startup`.

#### 1.3.2 How the daemon works
Startup is made up of 3 parts:

- `daemon.vbs` (the actual daemon)
- `daemon.js` (a wrapper)
- The 2Keys server, ran by `daemon.js` with `2Keys serve`

`daemon.vbs` starts `daemon.js` using node in cmd, but doesn't show the window (runs in the background).

`daemon.js` is a wrapper around the 2Keys server that is run by `daemon.vbs` that handles logging and management of the daemon

The 2Keys server is the actual server that handles hotkey execution.

### 1.3.3 Daemon logs
The 2Keys daemon stores logs in the `.2Keys` project root. 
You may notice more verbose output in the logs.  To achieve this directly running `2Keys serve`, set the environment variable in your shell `DEBUG` to `*` (this differs for each shell, so i'm not going to try to explain it here.)

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
The 2Keys daemon sometimes doesn't stop correctly (see [#12](https://github.com/Gum-Joe/2Keys/issues/12)).

If you end up with a log file like this when attempting to restart the 2Keys daemon:
```
events.js:167
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use :::8181
    at Server.setupListenHandle [as _listen2] (net.js:1290:14)
    at listenInCluster (net.js:1338:12)
    at Server.listen (net.js:1425:7)
    ...a bunch of other stuff

```
...it means the server is still running (that was supposed to be terminated on restart).  Open Task Manager and find these two tasks:

![https://raw.githubusercontent.com/Gum-Joe/2Keys/master/docs/Process.png](https://raw.githubusercontent.com/Gum-Joe/2Keys/master/docs/Process.png)

These processes correspond to the daemon wrapper and server. Terminate them both.

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
First, make sure the 2Keys server is running.  Then, create a new directory to store your project in, in a location of your choice (`mkdir path/to/dir`) and enter it (`cd path/to/dir`), replacing `path/to/dir` with a path to the directory (folder) to set 2Keys up in.

**Note**: The command `mkdir` makes a new directory (folder) and `cd` sets the current dir (directory) to the path specified

Then, run:
```
$ 2Keys init
```

Answer the questions as they come up, supplying the same values for port and IP Address as you did in 1.2.

You can see your 2Keys project is setup by running:
```
$ ls
```
Output:
```
config.yml
```

You can watch a keyboard and start watching for keypresses and sending them to the server with:
```
$ 2Keys watch keyboard
```
Where `keyboard` is the keyboard name in the config.
### 2.2.1 Config changes
If you make a config change on the server, sync it to the pi using:
```
$ 2Keys sync
$ sudo bash ./.2Keys/register.sh restart
```
DON'T update the config directly on the Pi, as it will be overwritten at the next sync.
### 2.3 Starting 2Keys on startup (detector)
On the detector we can't automatically add 2Keys to startup, as such you'll need to run the following command:
```
$ sudo bash ./.2Keys/register.sh register
```
This adds a systemd script for each keyboard (found in `.2Keys` on the detector) that start 2Keys when the detector starts.

#### 2.3.1 Additional commands
`register.sh` has some useful commands.  Run `sudo bash ./.2Keys/register.sh help` for information.

#### 2.3.2 Notes
2Keys will effectively lock the keyboard it's watching, which means only 2Keys can use it.  This is so you don't accidentally type things into the detector (i.e. accidentally running commands in a terminal) and there is no escape key from this (see [#6](https://github.com/Gum-Joe/2Keys/issues/6)).

## 3. Writing hotkeys
Ok, so your 2Keys project is now setup, time to write some hotkeys
### 3.1 How 2Keys works
2Keys works like so:

1. Detector watches and keeps track of keys pressed, and when a combo matches a hotkey it sends a request to the server telling it which keyboard the press was on and which hotkey to fire.
2. Server receives this request and directly links to AutoHotkey and runs the following:
```autohotkey
#Include path/to/root.ahk ; I.e keyboard_1/index.ahk
MyFunction() ; The function you want to execute that runs the macro/hotkey
```

As such, your macros must exist as functions.

Go ahead and open the `index.ahk` in one of your keyboard dirs that you setup in 1.2.  For simplicity, i'm going to assume the keyboard dir and name is `keyboard_1`.  Read what's written in `index.ahk`

### 3.2 Your first hotkey
#### 3.2.1 The hotkey
As is a tradition in programming, we're going to write a simple Hello World program.  Create a new file called `hello.ahk` in `keyboard_1` and add the following contents:
```autohotkey
HelloWorld() {
  MsgBox "Hello World!"
}
```
**Note:** I recommend writing your hotkeys like this, in separate files with functions for each hotkey.  If multiple hotkeys can be grouped together (i.e. hotkeys that run for a specific application) put them in a subfolder together.

Now, open `index.ahk` and find these lines:
```autohotkey
; Include all your AutoHotkey scripts here
; i.e. #Include "run-apps.ahk"
```

Underneath import `hello.ahk`:
```autohotkey
; Include all your AutoHotkey scripts here
; i.e. #Include "run-apps.ahk"
#Include hello.ahk
```
**Note:** Since 2Keys uses AutoHotkey V2, relative imports are allowed.

This will add `hello.ahk` to the root, which is loaded by 2Keys, thus allowing the hotkey function to be assigned.

#### 3.2.2 How hotkeys are assigned
Hotkeys are assigned in the `hotkeys` section of config in the format:
```yml
key_code: FunctionName
# For example
A: HelloWorld # Runs our hello world function when the A key is pressed
```

Additionally, you can specify whether the hotkey should fire on up or down of a key, like so:
```yml
C:
  type: up # Default: down
  func: HelloWorld
```
Which would run our HelloWorld function when the C key goes up (is unpressed)

You can also have separate events fire on up and down:
```yml
D:
  type: multi # You can safely omit this line
  func:
    down: HelloWorld
    up: SomeOtherFunction
```
Which would run our HelloWorld function when the D key is pressed, and SomeOtherFunction when it is unpressed.

For the list of key codes & additional information (such as how to use `ctrl` etc. or keys such as the ones on the numpad) see `MAPPING.md`:
[https://github.com/Gum-Joe/2Keys/blob/master/docs/MAPPINGS.md](https://github.com/Gum-Joe/2Keys/blob/master/docs/MAPPINGS.md)

#### 3.2.3 Assigning our hotkeys
Now, open `config.yml` and find the hotkeys line:
```yml
keyboards:
  keyboard_1:
    # ...rest of config...
    hotkeys: {}
```
We're going to remap `HelloWorld` to the `H` key:
```yml
keyboards:
  keyboard_1:
    # ...rest of config...
    hotkeys:
      H: HelloWorld
```

You can test if the hotkey works by running:
```shell
$ 2Keys fire keyboard_1 H
```
**Note:** `2Keys fire` is very useful command for testing hotkeys with the format `2Keys fire <keyboard> <key_code>`.  Note that in shells such as PowerShell keycodes may not be communicated correctly and escape characters may need to be used.

### 3.2.4 Enabling hotkey changes
You've just gone and written and assigned your first hotkey.  However, as the detector is a separate computer it doesn't know about the assignment as the detector runs on a separate computer.  Go ahead and ssh into your raspberry pi and go to the directory that you setup 2Keys in.  Run these commands:
```
$ 2Keys sync
$ sudo bash ./.2Keys/register.sh restart
```
The first downloads the updated config from the server and the second restarts the 2Keys daemon on the detector.

Now, just hit `H` on `keyboard_1` and you should see the following:

![https://raw.githubusercontent.com/Gum-Joe/2Keys/master/docs/HelloWorld.png](https://raw.githubusercontent.com/Gum-Joe/2Keys/master/docs/HelloWorld.png)

**Note:** when AutoHotkey (from 2Keys) creates a window of any kind it will now show up as this icon in the taskbar (the one highlighted):

![https://raw.githubusercontent.com/Gum-Joe/2Keys/master/docs/ErrorIcon.png](https://raw.githubusercontent.com/Gum-Joe/2Keys/master/docs/ErrorIcon.png)

## 4. Additional notes
### 4.1 Workaround so you don't have to rewrite scripts in AutoHotkey v2
Just run the script using AHK V1 (installed and set to the default program for `.ahk` files) directly:
```autohotkey
MyFunction() {
  Run "path/to/the/authotkey/script.ahk"
}
```

I'll be adding support for AHK v1 later, via a method similar to this (AutoHotkey_H V1 doesn't play nice with 2Keys)

## 5. Helpers
Since the detector is on a separate computer, functions such as `GetKeyState` won't work.  As such, I plan to implement helpers to replace these function. See [#2](https://github.com/Gum-Joe/2Keys/issues/2)
