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
# Sync keyboard path to server
import aiohttp
import aiofiles
import os
import yaml
from ..util import load_config, Logger
from ..util.constants import UPDATE_KEYBOARD_PATH

logger = Logger("sync")
async def update_server_keyboard_path(name, keyboard_path):
  logger.info("Updating config...")
  logger.debug("Loading config...")
  async with aiofiles.open(os.getcwd() + "/config.yml", mode="r") as config_file:
      logger.debug("ASYNC FILE OPS") # DEBUG: signal start of async file ops, so as to help detect where program breaks
      config_contents = await config_file.read() # Read config
      logger.debug("Contents:\n" + config_contents)
      config = yaml.load(config_contents) # Parse it into python obj
      logger.debug("Parsed contents: " + str(config))
      try:
        async with aiohttp.ClientSession() as session:
          async with session.post("http://" + config["addresses"]["server"]["ipv4"] + ":" + str(config["addresses"]["server"]["port"]) + UPDATE_KEYBOARD_PATH,
                    json={ "keyboard": name, "path": keyboard_path }) as resp:
            if int(resp.status) != 200:
              logger.err("ERROR Updating paths!")
              logger.err(await resp.text())
      except aiohttp.Error as err:
        logger.err(err)
