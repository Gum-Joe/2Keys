import sys
import requests
import json
import os
from os import path
import yaml
from logger import Logger

logger = Logger("oobe")
KEYBOARDS_PATH = "/dev/input/by-id"

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
config_file.write("# Config for 2Keys\n# ONLY FOR USE BY THE PROGRAM\n# To change the config, update it on the client and run \"2Keys config-update\" here\n" + yaml.dump(config))

# Then scan for keyboards
logger.info("") # To make output look better
logger.info("Scanning for keyboards...")
if not path.isdir(KEYBOARDS_PATH): # Make sure there's something to detect
  logger.err("Couldn't scan for keyboards")
  logger.err("Verify you have at least one keyboard plugged in and")
  logger.err("The dir /dev/input/by-id exists")
  exit()
# Scan
# From https://stackoverflow.com/questions/3207219/how-do-i-list-all-files-of-a-directory
keyboards = [keyboard for keyboard in os.listdir(
    KEYBOARDS_PATH) if path.isfile(path.join(KEYBOARDS_PATH, keyboard))]
logger.debug("Keyboards:")
logger.debug(keyboards)

logger.info("Press a button on the keyboard you want to map to register it.")
# Then watch all keyboards and ask for one to be pressed
# Add paths, sync changes to server
