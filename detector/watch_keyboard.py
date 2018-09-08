# Code originally from https://stackoverflow.com/questions/5060710/format-of-dev-input-event
# I don't know how to handle structs, so i'm just leaving as is (i.e. in Python)
# Would be better if in Java (like rest of project), C++/C (native code), JS (like server)
# as it means rest of pi side might have to be in python 
#
# See https://github.com/torvalds/linux/blob/master/include/uapi/linux/input-event-codes.h for codes 
# and https://www.kernel.org/doc/Documentation/input/event-codes.txt for meanings

import struct
import time
import sys
import aiofiles
from constants import KEYBOARDS_PATH_BASE, KEYBOARD_EVENT_FORMAT, KEYBOARD_EVENT_SIZE
from logger import Logger

logger = Logger("detect")

# str keyboard: Keyboard file in /dev/input/by-id
class Keyboard:
    def __init__(self, keyboard):
        # File for input that corresponds to the keyboard.
        self.keyboard = KEYBOARDS_PATH_BASE + "/" + keyboard
        # Open keyboard events file in binary mode
        self.in_file = open(self.keyboard, "rb")
        # Run checker
        self.run = True
    async def keyboard_watcher(self):
        async with aiofiles.open(self.keyboard, "rb") as in_file:
            event = await in_file.read(KEYBOARD_EVENT_SIZE)  # Open input file
            # Only triggers when key pressed
            while event and self.run:
                print("[ASYNC DEBUG] Key pressed on " + self.keyboard)
                break;
            await in_file.close()
            return self.run
    # Stop watching as it's no longer needed
    def stop_watch(self):
        self.run = False
        self.in_file.close()
    
