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
from os import path, listdir
from ..util.constants import KEYBOARDS_PATH_BASE, KEYBOARD_EVENT_FORMAT, KEYBOARD_EVENT_SIZE
from ..util.logger import Logger
from ..watcher import AsyncKeyboard as AsyncKeyboardWatcher
logger = Logger("detect")

def add_keyboard(name, gen_handler):
  logger.info("Mapping keyboard " + name)
  logger.info("Scanning for keyboards...")
  if not path.isdir(KEYBOARDS_PATH_BASE): # Make sure there's something to detect
    logger.err("Couldn't scan for keyboards")
    logger.err("Verify you have at least one keyboard plugged in")
    logger.err("and the dir /dev/input/by-id exists")
    exit()
  # Scan
  # From https://stackoverflow.com/questions/3207219/how-do-i-list-all-files-of-a-directory
  keyboards = listdir(KEYBOARDS_PATH_BASE)
  logger.debug("Keyboards:")
  logger.debug(keyboards)

  logger.info("Press a button on the keyboard you want to map to register it.")
  # Then watch all keyboards and ask for one to be pressed
  keyboards_events = [AsyncKeyboardWatcher(keyboard_path) for keyboard_path in keyboards] # Keyboard watch classes for each input

  handler = gen_handler(keyboards_events, name) # The handler needs access to keyboards_events, which it won't on exe in the watcher, as well as keyboard name
  
  # Run
  jobs = [keyboards_events[i].keyboard_watcher(handler) for i in range(0, len(keyboards))] # Create jobs list
  loop = asyncio.get_event_loop()
  loop.run_until_complete(asyncio.wait(jobs))
