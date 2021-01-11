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
import evdev
from ..util.constants import ASSUMED_CONTROLLER_CONFIG_FILENAME, Fatal2KeysError, KEYBOARDS_PATH_BASE, KEYBOARD_EVENT_FORMAT, KEYBOARD_EVENT_SIZE, SCRIPTS_ROOT, MODULE_NAME, TWOKEYS_FIXED_HOME_CONFIG
from ..util.logger import Logger
from ..util.config import load_main_config, load_project_config, load_config_from_file
from ..watcher import AsyncKeyboard as AsyncKeyboardWatcher
from twokeys.util import constants
logger = Logger("detect")

# Function to add keyboards (s is emphasised) from config
def add_keyboards(config):
	for key, value in config["keyboards"].items():
			logger.info("Running script to add keyboard for keyboard " + colorful.cyan(key) + "...")
			print("")  # Padding
			system("cd " + getcwd() + " && python3 -m " + MODULE_NAME + " add " + key)
			print("")  # Padding

def link_keyboard(uuid: str, path_to_map_to: str = None, inputs_path = constants.KEYBOARDS_PATH_BASE, **kwargs):
	"""Links a keyboard to a UUID in the keyboard map

	Links a keyboard to a UUID in the keyboard map so that we can watch it for presses.

	Args:
		uuid: UUID of the keyboard to map in the 2Keys config
		path_to_map_to: Optional path of the device the keyboard is being mapped to
		inputs_path: Path, normally /dev/input/by-id, to look for input devices in
		**by_detection: Detect the keyboard by watching for a keypress on the right keyboard
	"""
	logger.info("Linking a new keyboard...")
	logger.info("============================")
	logger.info("	BEGIN LINKING")
	logger.info("============================")
	
	# STEP 0: Get main config for validatiomn
	main_config = load_main_config()

	# STEP 1: Validate
	logger.info(f"Validating provided UUID {uuid}...")
	if not filter(lambda x: "uuid" in x and x["uuid"] == uuid, main_config["controllerConfig"]["keyboards"]):
		# I.e. no matches for UUID found
		logger.err("Error! Could not find that UUID (therefore it is invalid)! Please check it has been pass through and added on the server.")
		raise Fatal2KeysError("Error! Could not find that UUID (therefore it is invalid)!")

	# Now that we know the UUID is good, MAP IT!

	# Step 4: SCAN!
	logger.info("Validation OK. Mapping a physical keyboard/input device to UUID " + uuid)
	if "by_detection" in kwargs and kwargs["by_detection"]:
		logger.info("Mapping keyboard by detection.")
		logger.info(f"Scanning for keyboards in {inputs_path}...")

		# NOTE: Does not work if you use evdev, since evdev just uses a wildcard to look for event*
		if not path.isdir(inputs_path): # Make sure there's something to detect
			logger.err(f"Couldn't scan for keyboards in {inputs_path}")
			logger.err("Verify you have at least one keyboard plugged in,")
			logger.err("and the dir " + inputs_path + " exists")
			logger.err("You can specify a custom path with the --inputs-path option")
			raise Fatal2KeysError(f"Couldn't scan for keyboards in {inputs_path} as it did not exist")

		# Now list
		keyboards = listdir(inputs_path)
		logger.debug("Keyboards:")
		logger.debug(keyboards)

		logger.info("Press a button on the keyboard you want to map to register it.")
		# Then watch all keyboards and ask for one to be pressed
		keyboards_events = [AsyncKeyboardWatcher(keyboard_path, inputs_path) for keyboard_path in keyboards] # Keyboard watch classes for each input



def add_keyboard(name, gen_handler, inputs_path):
	"""Adds a new keyboard.  DEPRECATED."""
	logger.warn("DEPRECATED. Please use the new link command instead.")
	# Check if paths not given
	config = load_project_config()
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
