import sys
import requests
import json
import os
from os import path
import yaml
import colorful
from util.constants import SCRIPTS_ROOT
from util.logger import Logger

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
logger.debug("Opening config...")
config_file = open("config.yml", "w")
logger.debug("Writing config...")
config_file.write("# Config for 2Keys\n# ONLY FOR USE BY THE PROGRAM\n# To change the config, update it on the client and run \"2Keys config-update\" here\n" +
                  yaml.dump(config, default_flow_style=False))
config_file.close() # Needed so that add keyboard can read it

# Then scan for keyboards
# Since running directly from here causes issues with async not stopping etc, holding everything up
# run 2Keys add
# (essentially run in another process)
# Do for each keyboard in config.keyboards
logger.info("Running scripts to add path for keyboard input...")
for key, value in config["keyboards"].items():
  logger.info("Running script to add keyboard for keyboard " + colorful.cyan(key) + "...")
  ADD_KEYBOARD_CLI = SCRIPTS_ROOT + "/add_keyboard-cli.py"
  print("") # Padding
  os.system("cd " + os.getcwd() + " && python3 "+ ADD_KEYBOARD_CLI + " " + key)
  print("") # Padding

# Sync changes
