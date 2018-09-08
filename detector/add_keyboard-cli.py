from add_keyboard import add_keyboard
import sys
from logger import Logger
logger = Logger("add")

KEYBOARD_NAME = sys.argv[1] if len(sys.argv) > 1 else "keyboard_1"

# IMPORTANT: Don't use non async functions in this.  That includes the logger
def gen_handler(keyboards):
  async def handler(keyboard):
    print("[DEBUG] STOPPING WATCH")
    for keyboard_stop in keyboards:
      print("[DEBUG] ROOT: STOPPING " + keyboard_stop.keyboard)
      await keyboard_stop.stop_watch()
      logger.info("Writing keyboard " + keyboard + " to " + KEYBOARD_NAME)
      return
  return handler

add_keyboard(KEYBOARD_NAME, gen_handler)