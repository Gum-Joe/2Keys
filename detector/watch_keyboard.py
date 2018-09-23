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

class Keyboard:
    def __init__(self, keyboard):
        self.keyboard = keyboard
        # File for input that corresponds to the keyboard.
        self.keyboard_path = KEYBOARDS_PATH_BASE + "/" + keyboard
        # Open keyboard events file in binary mode
        self.in_file = open(self.keyboard_path, "rb")
        self.event = None
        # Array of pressed keys
        # is array of booleans, with the index = key code
        # i.e. if pressed_or_not[2] == true, then 2 has been pressed down.  Once set to false, the key has been 'unpressed'
        self.pressed_or_not = [False] * 256 # Linux lists key codes 0 to 255
        # Current keys being pressed
        self.keys = ""
    def watch_keyboard(self):
        logger.info("Watching for key presses on " + self.keyboard + "...")
        self.event = self.in_file.read(KEYBOARD_EVENT_SIZE) # Open input file
        while self.event:
            (tv_sec, tv_usec, type, code, value) = struct.unpack(KEYBOARD_EVENT_FORMAT, self.event)
            # We only want event type 1, as that is a key press
            # If key is already pressed, ignore event provided value not 0 (key unpressed)
            if (type == 1 or type == 0x1) and (self.pressed_or_not[code] == False or value == 0):
                logger.debug("Key pressed. Code %u, value %u at %d.%d" %
                        (code, value, tv_sec, tv_usec))
                # Set key in array
                self.change_key_state(code)

                # 
                # Here we add the hotkey fire request
                # to /api/post/fire
                # with { keyboard, keys }

                # Need a way to detect difference between combo and single keys
                # Should effectivly watch array of keys pressed for a change
                # and see if it matches a hotkey
                # then prevent itself from refiring
                #elif type != 0 or code != 0 or value != 0:
                #    print("Event type %u, code %u, value %u at %d.%d" % \
                #        (type, code, value, tv_sec, tv_usec))
            else:
                # Events with code, type and value == 0 are "separator" events
                 print("===========================================")

            event = self.in_file.read(EVENT_SIZE)
        self.in_file.close()
    
    # Handle change of state (down/up) of key code
    # down = True
    # Up (as in not pressed) = False
    def change_key_state(self, code):
        if not self.pressed_or_not[code]:
            # Key not yet pressed
            # Add to self.keys string
            

        self.pressed_or_not[code] = not self.pressed_or_not[code]

# str keyboard: Keyboard file in /dev/input/by-id
class AsyncKeyboard:
    def __init__(self, keyboard):
        # File for input that corresponds to the keyboard.
        self.keyboard = KEYBOARDS_PATH_BASE + "/" + keyboard
        # Open keyboard events file in binary mode
        self.in_file = open(self.keyboard, "rb")
        # Run checker
        self.run = True
    # IMPORTANT: Don't use non async functions in this.  That includes the logger
    async def keyboard_watcher(self, callback):
        # Only seems to run on key press. Strange.
        # Solution, as this makes it hard to stop was to add a callback to part 2
        async with aiofiles.open(self.keyboard, "rb") as in_file:
            event = await in_file.read(KEYBOARD_EVENT_SIZE)  # Open input file
            while event and self.run:
                print("[ASYNC DEBUG] Key pressed on " + self.keyboard)
                break;
            await in_file.close()
            # Stop all
            if self.run:
                await callback(self.keyboard)
            return self.run
    # Stop watching as it's no longer needed
    async def stop_watch(self):
        print("[DEBUG] CLASS: STOPPING " + self.keyboard)
        self.run = False
        return
        #await self.in_file.close()
    
