# Code originally from https://stackoverflow.com/questions/5060710/format-of-dev-input-event
# I don't know how to handle structs, so i'm just leaving as is (i.e. in Python)
# Would be better if in Java (like rest of project), C++/C (native code), JS (like server)
# as it means rest of pi side might have to be in python 
#
# See https://github.com/torvalds/linux/blob/master/include/uapi/linux/input-event-codes.h for codes 
# and https://www.kernel.org/doc/Documentation/input/event-codes.txt for meanings
# Notes: Code 99 should not be interrupted

import struct
import time
import sys
import aiofiles
from constants import KEYBOARDS_PATH_BASE, KEYBOARD_EVENT_FORMAT, KEYBOARD_EVENT_SIZE, MAX_KEY_MAPS
from keyboard_map import keys as KEY_MAP
from logger import Logger

logger = Logger("detect")

class Keyboard:
    # keyboard: Keyboard config
    # name: Name of keyboard
    def __init__(self, keyboard, name):
        logger.debug("Got keyboard: " + str(keyboard))
        self.keyboard = keyboard
        self.name = name
        # File for input that corresponds to the keyboard.
        self.keyboard_path = keyboard["path"]
        # Open keyboard events file in binary mode
        self.in_file = open(self.keyboard_path, "rb")
        self.event = None
        # Array of pressed keys
        # is array of booleans, with the index = key code
        # i.e. if pressed_or_not[2] == true, then 2 has been pressed down.  Once set to false, the key has been 'unpressed'
        self.pressed_or_not = [False] * MAX_KEY_MAPS
        # Current keys being pressed
        self.keys = [""]
        # Local stores of key mappings
        self.map = KEY_MAP
        # Apply mappings
        if "map" in self.keyboard:
            self.apply_mappings(self.keyboard["map"])
        # Store hotkeys list
        self.hotkeys = self.standardise_hotkeys(keyboard["hotkeys"])
        # Store array of hotkeys split into chars as this makes checking easier
    
    # Custom mapping
    # Takes in key/value of key: code and adds to map array
    def apply_mappings(self, maps):
        for key, code in maps.items():
            logger.debug("Mapped " + key + " as (" + key + ") to code " + str(code))
            self.map[code] = "(" + key + ")"
    
    # Keyboard watcher
    def watch_keyboard(self):
        logger.info("Watching for key presses on " + self.name + "...")
        self.event = self.in_file.read(KEYBOARD_EVENT_SIZE) # Open input file
        while self.event:
            (tv_sec, tv_usec, type, code, value) = struct.unpack(KEYBOARD_EVENT_FORMAT, self.event)
            # We only want event type 1, as that is a key press
            # If key is already pressed, ignore event provided value not 0 (key unpressed)
            if (type == 1 or type == 0x1) and (self.pressed_or_not[code] == False or value == 0):
                logger.debug("Key pressed. Code %u, value %u at %d.%d. Mapping: %s" %
                        (code, value, tv_sec, tv_usec, self.map[code]))
                # Set key in array
                self.change_key_state(code)

                # Run alogrithm to check keys against hotkey
                checked_hotkey = self.check_for_hotkey()
                if checked_hotkey != False:
                    logger.info("Registered hotkey:")
                    logger.info(checked_hotkey)
                    logger.info(self.hotkeys[checked_hotkey])
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

            self.event = self.in_file.read(KEYBOARD_EVENT_SIZE)
        self.in_file.close()
    
    # Handle change of state (down/up) of key code
    # down = True
    # Up (as in not pressed) = False
    def change_key_state(self, code):
        if not self.pressed_or_not[code]:
            # Key not yet pressed
            # Add to self.keys string
            if isinstance(self.map[code], str):
                self.keys = [combo + self.map[code] for combo in self.keys] # Add to each candidate combo                  
            else:
                # Array in use
                # Add as different candidates
                new_keys = []
                for combo in self.keys:
                    for mapping in self.map[code]:
                        new_keys.append(combo + mapping)
                self.keys = new_keys   
        else:
            # Key unpressed, remove
            if isinstance(self.map[code], str):
                self.keys = [combo.replace(self.map[code], "") for combo in self.keys] # Remove from each combo
            else:
                # Array
                new_keys = []
                for combo in self.keys:
                    for mapping in self.map[code]:
                        new_keys.append(combo.replace(mapping, "")) # Remove from each
        # Flip state
        self.pressed_or_not[code] = not self.pressed_or_not[code]
    
    # Standardise hotkey config
    # hotkey = hotkeys mappings
    # Standard config:
    #   type: down
    #   func: Function
    def standardise_hotkeys(self, hotkeys):
        new_hotkeys = hotkeys
        for key, value in new_hotkeys.items():
            if isinstance(value, str):
                # Only has function
                new_hotkeys[key] = {
                    "type": "down",
                    "func": value
                }
            # Else it has to be a regular one as ups require type: up
        return new_hotkeys
    
    # Hotkey detector algorithm
    # Return the key of the hotkey if hotkey
    def check_for_hotkey(self):
        # Check each candidate
        for combo in self.keys:
            for key, mapping in self.hotkeys.items():
                # Check each candidate
                # Step 1: Check length.  If lengths are different, hotkeys can't match
                if len(key) != len(combo):
                    continue
                # Step 2: Check if chars are equal
                split_hotkey = key.split("") # Split into array for easy checking
                split_current_keys = combo.split("")
                if set(split_hotkey).issubset(self.keys) or set(self.keys).issubset(split_hotkey):
                    return key # Candidate and hotkey matches, return hotkey location
            
        # If none are true, then this isn't the right one (function yet to return)
        return False
            


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
    
