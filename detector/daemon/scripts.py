import sys
import pystache
from util.logger import Logger
from util.constants import DAEMON_TEMPLATE_PATH, SCRIPTS_ROOT

logger = Logger("daemon")
# Generates a systemd unit file
# Name: Name of 2Keys project
# Keyboards: Array of keyboard names
def generate_daemon(name, keyboards):
  logger.info("Creating systemd unit scripts...")
  template = open(DAEMON_TEMPLATE_PATH, "r").read() # Open template
  for keyboard in keyboards:
    print(pystache.render(template, {
      "name": name,
      "index_path": SCRIPTS_ROOT + "/cli/index.py",
      "keyboard": keyboard,
      "detector_path": SCRIPTS_ROOT,
      "version": str(sys.version_info[0]) + "." + str(sys.version_info[1])
    }))
  
