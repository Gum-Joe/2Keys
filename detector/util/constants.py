# Constants
import struct
import os
KEYBOARDS_PATH_BASE = "/dev/input/by-id"

# Formatting for keyboard events
#long int, long int, unsigned short, unsigned short, unsigned int
KEYBOARD_EVENT_FORMAT = 'llHHI'
KEYBOARD_EVENT_SIZE = struct.calcsize(KEYBOARD_EVENT_FORMAT)

# Max key maps
MAX_KEY_MAPS = 250

# Script root
SCRIPTS_ROOT = os.path.dirname(os.path.realpath(__file__))

# Config file
CONFIG_FILE = "config.yml"

# REquest dir for sync
UPDATE_KEYBOARD_PATH = "/api/post/update-keyboard-path"


