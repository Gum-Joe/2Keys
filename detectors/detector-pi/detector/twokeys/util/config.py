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
# Config loader#
from os import path
from typing import Dict
import yaml
from .constants import ASSUMED_CONTROLLER_CONFIG_FILENAME, Fatal2KeysError, PROJECT_CONFIG_FILE, TWOKEYS_FIXED_HOME_CONFIG
from ..util.logger import Logger
logger = Logger("config")

def load_config_from_file(fileName: str):
	logger.debug(f"Loading config from file {fileName}...")
	config_file = open(fileName, "r")
	contents = yaml.load(config_file.read(), Loader=yaml.FullLoader)
	config_file.close()
	return contents

def load_project_config():
	logger.debug("Loading config...")
	return load_config_from_file(PROJECT_CONFIG_FILE)

class FatalConfigLoadError(Fatal2KeysError):
	"""Used for when a fatal config load error occurs which likely means the program can't proceed"""

def load_main_config() -> Dict[str, str]:
  """
  Loads the main config, based on the fixed config
  
  :returns The config as a dict.
	:raises FatalConfigLoadError Raises this error when it gets a KeyError retrieving the root config location from the fixed config. 
  """
  logger.info("Loading config...")
  # STEP 1: Load fixed configlogger.debug("Loading fixed config...")
  fixed_config = load_config_from_file(TWOKEYS_FIXED_HOME_CONFIG)
  config_root = ""
  try:
    config_root = fixed_config["client"]["roots"]["config"]
  except KeyError as err:
    logger.err("Error! Could not get config root from fixed config.")
    logger.err("This may mean the config is corrupt or invalid.")
    logger.err("It is reccomended you reprovision this client with 2Keys provision.")
    logger.debug(str(err))
    raise FatalConfigLoadError("Error! Could not get config root from fixed config. This may mean the config is corrupt or invalid.")
  # Access main configlogger.debug("Loaded. Loading main config....")
  main_config_path = path.join(config_root, ASSUMED_CONTROLLER_CONFIG_FILENAME)
  logger.debug(f"Loading from {main_config_path}...")
  return load_config_from_file(main_config_path)
