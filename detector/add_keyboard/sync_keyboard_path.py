# Sync keyboard path to server
import aiohttp
from util import load_config, Logger
from util.constants import UPDATE_KEYBOARD_PATH

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
          async with session.post("http://" + config["addresses"]["server"]["ipv4"] + ":" + config["addresses"]["server"]["port"] + {UPDATE_KEYBOARD_PATH}, data={ "keyboard": name, "path": keyboard_path }) as resp:
            print(resp)
      except aiohttp.Error as err:
        logger.err(err)
