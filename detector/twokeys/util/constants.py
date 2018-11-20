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
KEYBOARDS_PATH_BASE = "/dev/input/by-id"

# Formatting for keyboard events
#long int, long int, unsigned short, unsigned short, unsigned int
KEYBOARD_EVENT_FORMAT = 'llHHI'
KEYBOARD_EVENT_SIZE = struct.calcsize(KEYBOARD_EVENT_FORMAT)

# Max key maps
MAX_KEY_MAPS = 250

# Script root
SCRIPTS_ROOT = os.path.dirname(os.path.realpath(__file__)) + "/.."

# Config file
CONFIG_FILE = "config.yml"

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
