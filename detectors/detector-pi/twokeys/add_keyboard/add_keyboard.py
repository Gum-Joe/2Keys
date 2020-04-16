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
# Function to detect a keyboard
import asyncio
from os import path, listdir, getcwd, system
import colorful
from ..util.constants import KEYBOARDS_PATH_BASE, KEYBOARD_EVENT_FORMAT, KEYBOARD_EVENT_SIZE, SCRIPTS_ROOT, MODULE_NAME
from ..util.logger import Logger
from ..util.config import load_config
from ..watcher import AsyncKeyboard as AsyncKeyboardWatcher
logger = Logger("detect")

# Function to add keyboards (s is emphasised) from config
def add_keyboards(config):
  for key, value in config["keyboards"].items():
      logger.info("Running script to add keyboard for keyboard " + colorful.cyan(key) + "...")
      print("")  # Padding
      system("cd " + getcwd() + " && python3 -m " + MODULE_NAME + " add " + key)
      print("")  # Padding


def add_keyboard(name, gen_handler, inputs_path):
  # Check if paths not given
  config = load_config()
  if name == "" or name not in config["keyboards"]:
    logger.warn("No keyboard supplied.")
    logger.warn("Detection will be ran on all keyboards.")
    logger.warn("To just generate daemons, use the 'daemon-gen' command")
    logger.info("Running detection on all keyboards...")
    return add_keyboards(config)

  logger.info("Mapping keyboard " + name)
  logger.info("Scanning for keyboards...")
  if not path.isdir(inputs_path): # Make sure there's something to detect
    logger.err("Couldn't scan for keyboards")
    logger.err("Verify you have at least one keyboard plugged in")
    logger.err("and the dir " + inputs_path + " exists")
    logger.err("You can specify a custom path with the --inputs-path option")
    exit()
  # Scan
  # From https://stackoverflow.com/questions/3207219/how-do-i-list-all-files-of-a-directory
  keyboards = listdir(inputs_path)
  logger.debug("Keyboards:")
  logger.debug(keyboards)

  logger.info("Press a button on the keyboard you want to map to register it.")
  # Then watch all keyboards and ask for one to be pressed
  keyboards_events = [AsyncKeyboardWatcher(keyboard_path, inputs_path) for keyboard_path in keyboards] # Keyboard watch classes for each input

  handler = gen_handler(keyboards_events, name) # The handler needs access to keyboards_events, which it won't on exe in the watcher, as well as keyboard name
  
  # Run
  jobs = [keyboards_events[i].keyboard_watcher(handler) for i in range(0, len(keyboards))] # Create jobs list
  loop = asyncio.get_event_loop()
  loop.run_until_complete(asyncio.wait(jobs))
