# Sync keyboard path to server
import aiohttp
from util import UPDATE_KEYBOARD_PATH, load_config

async def update_server_keyboard_path(name, keyboard_path):
  config = await load_config()
  async with aiohttp.ClientSession() as session:
    async with session.post("http://" + config["addresses"]["server"]["ipv4"] + ":" + config["addresses"]["server"]["port"] + {UPDATE_KEYBOARD_PATH}, params={ "keyboard": name, "path": keyboard_path }) as resp:
      print(resp)
