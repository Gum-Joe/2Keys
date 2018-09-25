# Start a watcher for a keyboard
import sys
from watch_keyboard import Keyboard
from config import load_config
from logger import Logger

logger = Logger("cli")

if len(sys.argv) <= 1:
  logger.err("Please provide a keyboard to watch.")
  exit()

# Keyboard specified, watch it
config = load_config()
keyboard = Keyboard(config["keyboards"][sys.argv[1]], sys.argv[1])

keyboard.watch_keyboard()