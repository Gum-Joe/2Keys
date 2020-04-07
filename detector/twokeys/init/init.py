"""
Copyright 2018 Kishan Sambhi

This file is part of 2Keys.

2Keys is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

2Keys is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
"""
import sys
import requests
import json
import os
from os import path
import yaml
import colorful
from ..util.constants import SCRIPTS_ROOT, DEFAULT_PORT, MODULE_NAME
from ..util.logger import Logger
from ..util.config import load_config
from ..daemon import generate_daemon
from ..add_keyboard import add_keyboards

logger = Logger("init")

def init(**args):
  logger.info("Welcome to the INIT for the detector!")
  ipv4 = None
  port = DEFAULT_PORT
  # Use opts if we can
  if args["address"] == None:
    logger.info("First we need to know where to find the server")
    logger.info("Enter the ipv4 address of the server below:")
    ipv4 = input("")
  else:
    ipv4 = args["address"]
  
  # Port arg
  if args["port"] == None:
    logger.info("Enter the port of the server below:")
    port = input("")
  else:
    port = args["port"]

  # Make request, get config in JSON format
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
  logger.debug("Opening config file handler...")
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
  # Check for --no-path-request, which implies paths are already in config
  if args["no_path_request"]:
    logger.warn("--no-path-request flag was given")
    logger.warn("It is assumed all keyboard /dev/input paths are already given in the config.")
    logger.warn("Skipping to daemon generation.")
  else:
    add_keyboards(config)

  # Add daemons
  generate_daemon(config["name"], config["keyboards"].keys())
