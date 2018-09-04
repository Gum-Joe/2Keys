import sys
import requests
import json
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
config = requests.get("http://" + ipv4 + ":" + port + "/api/get/config")
parsed_config = json.loads(config.text)

# Save config
# Then scan for keyboards
# Then watch all keyboards and ask for one to be pressed
# Add paths, sync changes to server