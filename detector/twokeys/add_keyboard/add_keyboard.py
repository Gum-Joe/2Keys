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