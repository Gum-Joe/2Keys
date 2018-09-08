from add_keyboard import add_keyboard
import sys
import aiofiles
from logger import Logger
import yaml
logger = Logger("add")

KEYBOARD_NAME = sys.argv[1] if len(sys.argv) > 1 else "keyboard_1"

# IMPORTANT: Don't use non async functions in this.  That includes the logger
def gen_handler(keyboards):
  async def handler(keyboard):
    print("[DEBUG] STOPPING WATCH")
    for keyboard_stop in keyboards:
      print("[DEBUG] ROOT: STOPPING " + keyboard_stop.keyboard)
      await keyboard_stop.stop_watch()
      logger.info("Writing keyboard " + keyboard + " as " + KEYBOARD_NAME)
      logger.debug("Opening config...")
      async with aiofiles.open("config.yml", mode="r") as config_file:
        logger.debug("ASYNC FILE OPS")
        config_contents = await config_file.read()
        logger.debug("Contents:\n" + config_contents)
        config = yaml.load(config_contents)
        logger.debug("Parsed contents")
        config["keyboards"][KEYBOARD_NAME]["path"] = keyboard
        logger.debug("Writing config...")
        async with aiofiles.open("config.yml", mode="w") as config_write:
          await config_write.write("# Config for 2Keys\n# ONLY FOR USE BY THE PROGRAM\n# To change the config, update it on the client and run \"2Keys config-update\" here\n" +
                      yaml.dump(config, default_flow_style=False))
          logger.info("Config writen")
        exit()
      return
  return handler

add_keyboard(KEYBOARD_NAME, gen_handler)
print("DOES THIS EXE?")