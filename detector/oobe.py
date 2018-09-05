import sys
import requests
import json
import os
from logger import Logger

logger = Logger("oobe")

logger.info("Welcome to the OOBE for the detector!")
logger.info("First we need to know where to find the server")
logger.info("Enter the ipv4 address of the server below:")
ipv4 = input("")
logger.info("Enter the port of the server below:")
port = input("")

# Make request, get config in JSON format
# TODO: Error handling
config_json = requests.get("http://" + ipv4 + ":" + port + "/api/get/config")
if config_json.status_code >= 400: # i.e. 404 or 500
  logger.err("ERROR: Request for config unsucessful!")
  logger.err("Got status code " + str(config_json.status_code) + " with response:")
  logger.err(config_json.text)
  logger.debug("Headers: ")
  logger.debug(str(config_json.headers))
config = json.loads(config_json.text)


# Save config
logger.info("Saving config to " + os.getcwd())
# Then scan for keyboards
print("")
logger.info("Scanning for keyboards...")
logger.info("Press a button on the keyboard you want to map to register it.")
# Then watch all keyboards and ask for one to be pressed
# Add paths, sync changes to server
