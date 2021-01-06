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
# See https://github.com/torvalds/linux/blob/master/include/uapi/linux/input-event-codes.h for codes 
# and https://www.kernel.org/doc/Documentation/input/event-codes.txt for meanings
# Notes: Code 99 should not be interrupted
# NOTE: Now to solve hotkey duplication

import struct
import time
import sys
import signal
import asyncio
import aiofiles
import evdev
from evdev.util import categorize
import requests
import json
from evdev import InputDevice
from os import path
from ..util.constants import KEYBOARDS_PATH_BASE, KEYBOARD_EVENT_FORMAT, KEYBOARD_EVENT_SIZE, KEY_VALUE_DOWN, KEY_VALUE_UP, MAX_KEY_MAPS
from ..util.keyboard_map import keys as KEY_MAP
from ..util.config import load_config
from ..util.logger import Logger

logger = Logger("detect")

class Keyboard:
    """Class to watch the input devices for a keyboard (i.e. the files for it in /dev/input - there can be multiple!)

    Watches for changes asyncroneously on all the files, and triggers hotkeys as needed

    NOTE: key states are tracker accross devices - so if e.g. 2 devices that both have an "A" key
    are registered under the same keyboard in config, pressing "A" on one keyboard is indistinghable from "A" on the other,

    :param keyboard: Keyboard config
    :param name: Name of keyboard
    :param full_config: Full config (so we get to e.g perms)
    
    kwargs:
    - no_lock: CLI option that says "dont lock KBD"
    """
    def __init__(self, keyboard, name, full_config, **kwargs):
        self.config = load_config()
        logger.debug("Got keyboard: " + str(keyboard))
        self.keyboard = keyboard
        self.name = name
        self.full_config = full_config
        self.detector_config_project = full_config["detector_config"]
        self.cli_args = kwargs
        # Generate input devices from the list of related paths!
        self.keyboard_devices = [ InputDevice(keyboardPath) for keyboardPath in self.keyboard["detector"]["paths"] ]
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
        # current hotkey, used for when watching for an up event
        self.current_hotkey_up = None
        self.last_hotkey = None
        
    
    
    def apply_mappings(self, maps):
        """
        Applies custom mappings.

        Takes in key/value of key to code and adds to map array.

        NB: The map array hold the mapping of all key codes to the strings used to denoted them in configs.
        """
        for key, code in maps.items():
            logger.debug("Mapped " + key + " as (" + key + ") to code " + str(code))
            self.map[code] = "(" + key + ")"
    
    async def shutdown(self, loop, signal=None):
        logger.info("Shutting down...")
        tasks = [t for t in asyncio.all_tasks() if t is not
                asyncio.current_task()]

        [task.cancel() for task in tasks]

        logger.info(f"Cancelling {len(tasks)} outstanding tasks")
        await asyncio.gather(*tasks, return_exceptions=True)

        try:
            logger.debug("Unlocking KDB to finish shutdown...")
            self.unlock()
        except Exception as err:
            logger.err("Error encountered during cleanup!")
            logger.err(err)
            logger.err("The program will now exit.")
            loop.stop()
        loop.stop()

    def handle_exception(self, loop, context):
        # context["message"] will always be there; but context["exception"] may not
        msg = context.get("exception", context["message"])
        logger.err(f"Caught exception: {msg}")
        print(context)
        logger.debug("Shutting down due to error...")
        asyncio.create_task(self.shutdown(loop))

    def watch_keyboard(self):
        """Starts the async watcher to watch the keyboard. Also locks the keyboard so nothing else can use it"""
        self.lock()
        loop = asyncio.get_event_loop()
        signals = (signal.SIGHUP, signal.SIGTERM, signal.SIGINT)
        for s in signals:
            loop.add_signal_handler(
                s, lambda s=s: asyncio.create_task(self.shutdown(loop, signal=s)))
        loop.set_exception_handler(self.handle_exception)

        logger.info("Starting watchers...")
        for keyboard_device in self.keyboard_devices:
            loop.create_task(self.watch_keyboard_handler(keyboard_device))
        #loop.create_task(self.watch_keyboard_handler())
        loop.run_forever()

    async def watch_keyboard_handler(self, device_handler: InputDevice):
        """
        Keyboard watcher - watches keyboard for events and triggers hotkeys by sending events to server according to config
        :param device_hander: EvDev InputDevice object.

        # TODO: Use const from evdev instead of manually checking for cleaner code and no magic numbers
        """
        logger.info("Watching async for key presses on " + self.name + ", path " + device_handler.path + "...")
        async for event in device_handler.async_read_loop():
            # print(categorize(event))
            type = event.type # Event type - only interested in key event (EV_KEY)
            code = event.code # KDB Scan Code
            value = event.value # Value - up, down, hold.
            # We only want event type 1, as that is a key press
            # If key is already pressed, ignore event provided value not 0 (key unpressed)
            if type == evdev.ecodes.EV_KEY:
                logger.info("Key pressed. Code %u, value %u. Mapping: %s" %
                        (code, value, self.map[code]))
    
                # Set key in array
                # Only done if value 1 (down) so as to not conflict with ups
                if value == KEY_VALUE_DOWN:
                    self.change_key_state(code, value)
                    logger.debug(self.keys)

                # Run alogrithm to check keys against hotkey
                # Only run though if value is 0  (down) or 1 (up) to prevent duplicate hotkeys
                if value == KEY_VALUE_DOWN or value == KEY_VALUE_UP:
                    # Proceed with regular hotkey logic
                    checked_hotkey = self.check_for_hotkey(self.keys)
                    if checked_hotkey != False:
                        hotkey = self.hotkeys[checked_hotkey]
                        logger.info("Registered hotkey:")
                        logger.info(checked_hotkey)
                        logger.info(hotkey)
                        # Is is an up, down, or multi function?
                        if hotkey["type"] == "down" and value == 1:
                            self.send_hotkey(checked_hotkey, value)
                        elif hotkey["type"] == "up" and value == 0:
                            self.send_hotkey(checked_hotkey, value)
                        elif hotkey["type"] == "multi":
                            # The server handles picking the right hotkey
                            self.send_hotkey(checked_hotkey, value)
                        else:
                            logger.warn("Hotkey not send as it's type " + hotkey["type"])
                
                # Set key in array
                # Only done if value 0 (up) so as to not conflict with downs
                if value == KEY_VALUE_UP:
                    self.change_key_state(code, value)
                    logger.debug(self.keys)

                #elif type != 0 or code != 0 or value != 0:
                #    print("Event type %u, code %u, value %u at %d.%d" % \
                #        (type, code, value, tv_sec, tv_usec))
            else:
                # Events with code, type and value == 0 are "separator" events
                 print("===========================================")
    
    def change_key_state(self, code, value):
        """Handle change of state (down/up) of key code.
        
        down, as in has been detected recently as down/up/held = True
        Up (as in not pressed and so has no state - this does NOT mean unpressed) = False

        Args:
            code: int key code (that is an index in self.map, the key map) of key that's state has been modified
            value: int Value to set the key code to (one of KEY_VALUE<DOWN|UP|HOLD>)
        """

        """Constant for this function of a key having a state, i.e. has been detected recently as down/up/held"""
        KEY_HAS_SATE = True
        """Constant for this function of a key NOT having a state, i.e. has NOT been detected recently as down/up/held"""
        KEY_HAS_NO_SATE = False
        if value == KEY_VALUE_DOWN: 
            # Key not yet pressed, or just pressed, and so now has state
            self.pressed_or_not[code] = KEY_HAS_SATE
            # Add to self.keys string
            if isinstance(self.map[code], str):
                self.keys = [combo + self.map[code] for combo in self.keys] # Add to each candidate combo - these are the possible combos of key strings that have been pressed and need to be searched for                 
            else:
                # Array in use
                # Add as different candidates
                new_keys = []
                for combo in self.keys:
                    for mapping in self.map[code]:
                        new_keys.append(combo + mapping)
                self.keys = new_keys   
        elif value == KEY_VALUE_UP: # Key unpressed, and so no longer has a state to us
            # Key unpressed, remove
            self.pressed_or_not[code] = KEY_HAS_NO_SATE
            # Remove from combos
            if isinstance(self.map[code], str):
                self.keys = [combo.replace(self.map[code], "") for combo in self.keys] # Remove from each combo
            else:
                # Array
                for mapping in self.map[code]:
                    logger.debug("Checking mapping " + str(mapping))
                    new_keys = []
                    index = 0
                    while index < len(self.keys):
                        combo = self.keys[index]
                        if combo.find(mapping) >= 0 or combo == mapping: # Only should run if in, to avoid duplicates
                            new_combo = combo.replace(mapping, "")
                            if len(new_combo) > 0:
                                new_keys.append(new_combo) # Remove from each
                        index += 1
                    self.keys = new_keys
                # If keys array is empty, make sure to add somewhere for next set
                if len(self.keys) < 1:
                    self.keys = [""]
    

    def standardise_hotkeys(self, hotkeys):
        """
        Standardise (user's) hotkey config so we only have to deal with one type of config when looping through the user's config

        hotkey = hotkeys mappings
        
        Standard config:
          type: down
          func: Function
        """
        new_hotkeys = hotkeys
        for key, value in new_hotkeys.items():
            if isinstance(value, str):
                # Only has function
                new_hotkeys[key] = {
                    "type": "down",
                    "func": value
                }
            # Else it has to be a regular one OR a muti one as ups require type: up, muties just need an object
            # The below fixes #13. where if no type was specified but a func: was the program crashes
            elif "type" not in new_hotkeys[key]:
                # Function is present, but no type
                new_hotkeys[key]["type"] = ("down" if isinstance(value["func"], str) else "multi") # If func is str, use down, if not, use "multi"
        return new_hotkeys
    
    def check_for_hotkey(self, candidates):
        """
        Hotkey detector algorithm.
        Returns the key of the hotkey in the user's config if hotkey

        :param candidates: array of hotkey strings to check
        """
        # Check each candidate
        for combo in candidates:
            logger.debug("Checking hotkey in combo " + combo)
            for key, mapping in self.hotkeys.items():
                # Check each candidate
                # Step 1: Check length.  If lengths are different, hotkeys can't match
                if len(key) != len(combo):
                    continue
                # Step 2: Check if chars are equal
                split_hotkey = list(key) # Split into array for easy checking
                split_current_keys = list(combo)
                if set(split_hotkey).issubset(set(split_current_keys)) or set(split_current_keys).issubset(set(split_hotkey)):
                    return key # Candidate and hotkey matches, return hotkey location
            
        # If none are true, then this isn't the right one (function yet to return)
        return False
    
    def send_hotkey(self, hotkey, value):
        """Hotkey sender.

        Send hotkey runner command -> server
        
        :param hotkey: hotkey ref in config
        :param value: Value of event type (up, down) from evdev
        """
        logger.info("Sending hotkey %s to server..." % hotkey)
        try:
            data_hotkey = { "keyboard": self.name, "hotkey": hotkey, "value": value }
            TYPE_JSON = {"Content-Type": "application/json"} # So the server can interpret it
            requests.post("http://" + self.config["addresses"]["server"]["ipv4"] + ":" + str(self.config["addresses"]["server"]["port"]) + "/api/post/trigger", data=json.dumps(data_hotkey), headers=TYPE_JSON, timeout=2)
        except requests.exceptions.ConnectionError:
            logger.err("Couldn't estanblish a connection to the server.")
            logger.err("Please check your internet connection.")
        except requests.exceptions.Timeout:
            logger.err("The request timed out")
            logger.warn("This means either the server isn't running, or is busy running another hotkey.")
            logger.warn("Please note the hotkey may still execute after the server has finished running the hotkeys it is currently running")

    # Locks (grabs) keyboard
    def lock(self):
        # Check if this is allowed
        if not self.detector_config_project["perms"]["lockKBDs"] or self.cli_args["no_lock"]:
            # Either the lockKBd option is false, or the cli arg to not lock has been passed
            logger.warn("Not locking as keyboard locking disabled.")
            return
        logger.info("Locking keyboards....")
        for keyboard_device in self.keyboard_devices:
            logger.info("Locking " + keyboard_device.path + "...")
            keyboard_device.grab()
    # Unlocks (ungrabs) keyboard
    def unlock(self):
        # Check if this is allowed
        if not self.detector_config_project["perms"]["lockKBDs"] or self.cli_args["no_lock"]:
            # Either the lockKBd option is false, or the cli arg to not lock has been passed
            logger.warn("Not unlocking as keyboard locking disabled.")
            return
        logger.info("Unlocking keyboards...")
        for keyboard_device in self.keyboard_devices:
            logger.info("Unlocking " + keyboard_device.path + "...")
            keyboard_device.ungrab()


# str keyboard: Keyboard file in /dev/input/by-id
class AsyncKeyboard:
    # Root defaults to /dev/input/by-id
    def __init__(self, keyboard, root):
        # File for input that corresponds to the keyboard.
        self.keyboard = path.join(root, keyboard)
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
    
