import sys
import requests
import json
import os
import multiprocessing
import time
from os import path
import asyncio
import aiofiles
import yaml
from constants import KEYBOARDS_PATH_BASE, KEYBOARD_EVENT_FORMAT, KEYBOARD_EVENT_SIZE
from logger import Logger
from watch_keyboard import Keyboard as KeyboardWatcher

logger = Logger("oobe")

logger.info("Welcome to the OOBE for the detector!")
logger.info("First we need to know where to find the server")
logger.info("Enter the ipv4 address of the server below:")
ipv4 = input("")
logger.info("Enter the port of the server below:")
port = input("")

# Make request, get config in JSON format
# TODO: Error handling
logger.info("Fetching config...")
try:
  config_json = requests.get("http://" + ipv4 + ":" + port + "/api/get/config")
except requests.exceptions.ConnectionError:
  logger.err("Couldn't estanblish a connection to the server.")
  logger.err("Please check your internet connection.")
  exit() # Can't do any more
if config_json.status_code >= 400: # i.e. 404 or 500
  logger.err("ERROR: Request for config unsucessful!")
  logger.err("Got status code " + str(config_json.status_code) + " with response:")
  logger.err(config_json.text)
  logger.debug("Headers: ")
  logger.debug(config_json.headers)
  exit()
config = json.loads(config_json.text)


# Save config
logger.info("Saving config to " + os.getcwd() + "...")
config_file = open("config.yml", "w")
config_file.write("# Config for 2Keys\n# ONLY FOR USE BY THE PROGRAM\n# To change the config, update it on the client and run \"2Keys config-update\" here\n" +
                  yaml.dump(config, default_flow_style=False))

# Then scan for keyboards
logger.info("") # To make output look better
logger.info("Scanning for keyboards...")
if not path.isdir(KEYBOARDS_PATH_BASE): # Make sure there's something to detect
  logger.err("Couldn't scan for keyboards")
  logger.err("Verify you have at least one keyboard plugged in")
  logger.err("and the dir /dev/input/by-id exists")
  exit()
# Scan
# From https://stackoverflow.com/questions/3207219/how-do-i-list-all-files-of-a-directory
keyboards = os.listdir(KEYBOARDS_PATH_BASE)
logger.debug("Keyboards:")
logger.debug(keyboards)

logger.info("Press a button on the keyboard you want to map to register it.")
# Then watch all keyboards and ask for one to be pressed

# Add paths, sync changes to server
# Async helped by https://hackernoon.com/asynchronous-python-45df84b82434
keyboards_events = [KeyboardWatcher(keyboard_path) for keyboard_path in keyboards]
async def keyboard_watcher(keyboard):
  async with aiofiles.open(KEYBOARDS_PATH_BASE + "/" + keyboard, "rb") as in_file:
    event = await in_file.read(KEYBOARD_EVENT_SIZE)  # Open input file
    #logger.debug("Watching for key presses at " + self.keyboard + "...")
    print(keyboard)
    while event:
            print("W" + keyboard)
            (tv_sec, tv_usec, type, code, value) = struct.unpack(
                KEYBOARD_EVENT_FORMAT, event)
            # We only want event type 1, as that is a key press
            # If key is already pressed, ignore event provided value not 0 (key unpressed)
            if (type == 1 or type == 0x1):
                print("Key pressed. Code %u, value %u at %d.%d" %
                             (code, value, tv_sec, tv_usec))
                # We've got a press, RETURN
                await in_file.close()
                #return "yes"
            event = await in_file.read(KEYBOARD_EVENT_SIZE)  # Update file
        #return False

#async for keyboard in keyboards_events:
  

'''
async def keyboard_watcher(index_in_array):
  detect_keyboard = await keyboards_events[index_in_array].watch_keyboard()
  if detect_keyboard == "yes":
    # Kill others
    for keyboard in keyboards_events:
      keyboard.stop_watch()
    # Proceed
    logger.info("Path: " + keyboards_events[index_in_array].keyboard)
    return 1
  else:
    return 0



'''
jobs = [keyboard_watcher(keyboards[i]) for i in range(0, len(keyboards))]
loop = asyncio.get_event_loop()
loop.run_until_complete(asyncio.wait(jobs))
