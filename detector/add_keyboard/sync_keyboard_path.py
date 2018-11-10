# Sync keyboard path to server
import aiohttp
from util import load_config, Logger
from util.constants import UPDATE_KEYBOARD_PATH

logger = Logger("sync")
async def update_server_keyboard_path(name, keyboard_path):
  config = await load_config()
  try:
    async with aiohttp.ClientSession() as session:
      async with session.post("http://" + config["addresses"]["server"]["ipv4"] + ":" + config["addresses"]["server"]["port"] + {UPDATE_KEYBOARD_PATH}, data={ "keyboard": name, "path": keyboard_path }) as resp:
        print(resp)
  except aiohttp.ClientError as err:
    logger.err(err)
