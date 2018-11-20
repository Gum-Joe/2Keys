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
# wrapper, designed for adding a keyboard from CLI
from .add_keyboard import add_keyboard
import sys
import os
import signal
import aiofiles
from ..util import Logger
import yaml
from .sync_keyboard_path import update_server_keyboard_path
logger = Logger("add")

PID = os.getpid()

# IMPORTANT: Don't use non async functions in this.  That includes the logger
# EXCEPTIONS ARE NOT CAUGHT
def gen_async_handler(keyboards, keyboard_name):
  async def handler(keyboard):
    print("[DEBUG] STOPPING WATCH")
    # Stop each keyboard object one by one, then write config
    for keyboard_stop in keyboards:
      print("[DEBUG] ROOT: STOPPING " + keyboard_stop.keyboard)
      await keyboard_stop.stop_watch()
    
    # Write config
    logger.info("Writing keyboard " + keyboard + " as " + keyboard_name)
    logger.debug("Opening config...")  

    # 1: Open current file for updating
    async with aiofiles.open(os.getcwd() + "/config.yml", mode="r") as config_file:
      logger.debug("ASYNC FILE OPS") # DEBUG: signal start of async file ops, so as to help detect where program breaks
      config_contents = await config_file.read() # Read config
      logger.debug("Contents:\n" + config_contents)
      config = yaml.load(config_contents) # Parse it into python obj
      logger.debug("Parsed contents: " + str(config))
      config["keyboards"][keyboard_name]["path"] = keyboard # Update keyboard with path in /dev/input
      logger.debug("Writing config...")
      # r+ appends, so we have to create a new stream so we cam write
      async with aiofiles.open("config.yml", mode="w") as config_write:
        await config_write.write("# Config for 2Keys\n# ONLY FOR USE BY THE PROGRAM\n# To change the config, update it on the client and run \"2Keys config-update\" here\n" +
                    yaml.dump(config, default_flow_style=False)) # Write it
        await config_write.close() # Close so other programs can use
        logger.info("Config writen.")
        logger.info("Updating path on keyboard....")
        await update_server_keyboard_path(keyboard_name, keyboard)
        os.kill(PID, signal.SIGTERM) # Exit() does't work, so we have to self kill the script
      exit() # So only one ^C is needed to end the program
      return
  return handler
