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
    def watch_keyboard(self):
        event = self.in_file.read(KEYBOARD_EVENT_SIZE)  # Open input file
        logger.debug("Watching for key presses at " + self.keyboard + "...")
        while event and self.run:
            (tv_sec, tv_usec, type, code, value) = struct.unpack(
                KEYBOARD_EVENT_FORMAT, event)
            # We only want event type 1, as that is a key press
            # If key is already pressed, ignore event provided value not 0 (key unpressed)
            if (type == 1 or type == 0x1):
                logger.debug("Key pressed. Code %u, value %u at %d.%d" %
                             (code, value, tv_sec, tv_usec))
                # We've got a press, RETURN
                self.in_file.close()
                return True
            event = self.in_file.read(KEYBOARD_EVENT_SIZE)  # Update file
        return False
    # Stop watching as it's no longer needed
    def stop_watch(self):
        self.run = False
        self.in_file.close()
    
