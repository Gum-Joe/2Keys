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
# Constants
import struct
import os
from pathlib import Path
KEYBOARDS_PATH_BASE = "/dev/input/by-id"

"""Version Number"""
VERSION = "1.0.0a1"

# Formatting for keyboard events
#long int, long int, unsigned short, unsigned short, unsigned int
KEYBOARD_EVENT_FORMAT = 'llHHI'
KEYBOARD_EVENT_SIZE = struct.calcsize(KEYBOARD_EVENT_FORMAT)

# Max key maps
MAX_KEY_MAPS = 250

# Script root
SCRIPTS_ROOT = os.path.dirname(os.path.realpath(__file__)) + "/.."

# Project Config file, relative to project root
PROJECT_CONFIG_FILE = "config.yml"

# REquest dir for sync
UPDATE_KEYBOARD_PATH = "/api/post/update-keyboard-path"

# Default port
DEFAULT_PORT = 9090

# Systemd unit file location
DAEMON_TEMPLATE_PATH = os.path.join(SCRIPTS_ROOT, "./assets/service.service")
DAEMON_TEMPLATE_SCRIPT_PATH = os.path.join(SCRIPTS_ROOT, "./assets/register.sh")

# Local root
LOCAL_ROOT = os.getcwd() + "/.2Keys"

# Module name
MODULE_NAME = "twokeys"

# SCHEMAS
SCHEMA_ROOT = os.path.join(SCRIPTS_ROOT, "./assets/schemas")
SCHEMA_PROVISIONING = os.path.join(
    SCHEMA_ROOT, "client-side-provisioning-config.json")
SCHEMA_KDB_MAP = os.path.join(SCHEMA_ROOT, "client-side-keyboard-map.json")
SCHEMA_PROJECTS_MAP = os.path.join(SCHEMA_ROOT, "client-side-projects-map.json")

# Blank keyboard
# NOTE: Must match schema in assets/schemas/client-side-keyboard-map.json
BLANK_KEYBOARD_MAP = {
	"twokeys": {
		"version": VERSION,
		"createdBy": "DETECTOR",
		"type": "KEYBOARD_MAP"
	},
	"keyboards": {}
}
BLANK_PROJECT_MAP = {
	"twokeys": {
		"version": VERSION,
		"createdBy": "DETECTOR",
		"type": "PROJECT_MAP"
	},
	"projects": {}
}
"""File name of keyboard map, stored in config root"""
KEYBOARD_MAP_FILENAME = "keyboard-map.json"
"""File name of projects map, stored in projects root"""
PROJECT_MAP_FILENAME = "projects.json"
"""
Assumed location of controller config.
This is the one generated on the server by the controller.
It is stored in the config root.
"""
ASSUMED_CONTROLLER_CONFIG_FILENAME = "config.yml"

"""Fixed root to put important files in so that 2Keys can find all the other config files (such as keyboard map).  Allows us to make 2Keys platform-agnostic"""
TWOKEYS_FIXED_HOME = os.path.join(Path.home(), ".2Keys")
"""Fixed location of a copy of the provision config as it contain all the information we need to find the other config."""
TWOKEYS_FIXED_HOME_CONFIG = os.path.join(TWOKEYS_FIXED_HOME, "config-provision.yml")


# Key input constants
"""Key pressed down"""
KEY_VALUE_DOWN = 1 
"""Key unpressed (i.e. went up)"""
KEY_VALUE_UP = 0
"""Key held (held down)"""
KEY_VALUE_HOLD = 2


class Fatal2KeysError(Exception):
	"""Base class for all fatal 2Keys errors that require an exit"""