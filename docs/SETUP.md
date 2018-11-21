# How to setup 2Keys
This document will guide you through the process of setting up 2Keys

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
### 0.2 Setting up the detector
#### 0.2.1 Setting pi-config
#### 0.2.2 Assigning a static IP address
#### 0.2.3 Installing python & pip
## 1. Creating your first 2Keys project (server)
### 1.1 Installing 2Keys on the server
### 1.2 Creating your first project
### 1.3 Starting 2Keys on startup (server)
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
