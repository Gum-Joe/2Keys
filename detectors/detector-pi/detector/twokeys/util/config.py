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
# Config loader#
import yaml
from .constants import CONFIG_FILE
from ..util.logger import Logger
logger = Logger("config")

def load_config_from_file(fileName: str):
	logger.debug(f"Loading config from file {fileName}...")
	config_file = open(fileName, "r")
	contents = yaml.load(config_file.read(), Loader=yaml.FullLoader)
	config_file.close()
	return contents

def load_config():
	logger.debug("Loading config...")
	return load_config_from_file(CONFIG_FILE)
