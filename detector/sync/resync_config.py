# Script to resync config from server
import requests
import json
import yaml
import os
from util.logger import Logger
from util.config import load_config
from util.constants import CONFIG_FILE

logger = Logger("sync")
config = load_config()
address = "http://" + config["addresses"]["server"]["ipv4"] + ":" + config["addresses"]["server"]["port"] + "/api/get/config"

def sync_config():
  logger.info("Syncing config...")
  logger.debug("GET " + address)
  try:
    config_json = requests.get(address)
  except requests.exceptions.ConnectionError:
    logger.err("Couldn't estanblish a connection to the server.")
    logger.err("Please check your internet connection.")
    exit() # Can't do any more
  if config_json.status_code >= 400: # i.e. 404 or 500
    logger.err("ERROR: Request for config unsucessful!")
    logger.err("Got status code " + str(config_json.status_code) + " with response:")
    ogger.err(config_json.text)
    logger.debug("Headers: ")
    logger.debug(config_json.headers)
    exit()
  config = json.loads(config_json.text)

  # Save config
  logger.info("Saving config to " + os.getcwd() + "...")
  # Add IP to config
  logger.debug("Opening config...")
  config_file = open(CONFIG_FILE, "w")
  logger.debug("Writing config...")
  config_file.write("# Config for 2Keys\n# ONLY FOR USE BY THE PROGRAM\n# To change the config, update it on the client and run \"2Keys config-update\" here\n" +
                    yaml.dump(config, default_flow_style=False))
  config_file.close() # Needed so that add keyboard can read it