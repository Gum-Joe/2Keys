import sys
import os
import stat
import pystache
from ..util.logger import Logger
from ..util.constants import DAEMON_TEMPLATE_PATH, SCRIPTS_ROOT, LOCAL_ROOT, DAEMON_TEMPLATE_SCRIPT_PATH

logger = Logger("daemon")
# Generates a systemd unit file
# Name: Name of 2Keys project
# Keyboards: Array of keyboard names
def generate_daemon(name, keyboards):
  logger.info("Creating systemd unit scripts...")
  template = open(DAEMON_TEMPLATE_PATH, "r").read() # Open template
  for keyboard in keyboards:
    script = pystache.render(template, {
      "name": name,
      "index_path": SCRIPTS_ROOT + "/cli/index.py",
      "keyboard": keyboard,
      "detector_path": SCRIPTS_ROOT,
      "version": str(sys.version_info[0]) + "." + str(sys.version_info[1]),
      "pwd": os.getcwd()
    })
    if not os.path.exists(LOCAL_ROOT):
      logger.info("Making local root ./.2Keys...")
      os.makedirs(LOCAL_ROOT)
    
    UNIT_FILE_NAME = "2Keys-%s.service" % keyboard
    logger.info("Creating unit file {}...".format(UNIT_FILE_NAME))
    unitFile = open(LOCAL_ROOT + "/" + UNIT_FILE_NAME, "w")
    logger.info("Writing...")
    unitFile.write(script)   

  logger.info("Writing a shell script to manage the unit files (services/daemons)...")
  shTemplate = open(DAEMON_TEMPLATE_SCRIPT_PATH, "r").read()
  keyboard_string = "("
  # Create array of keyboards
  for keyboard in keyboards:
    keyboard_string += keyboard + " "
  # End array
  keyboard_string = keyboard_string[0:-1] + ")"
  # Render mustache template
  shScript = pystache.render(shTemplate, {
      "keyboards": keyboard_string
  })
  shScriptFile = open(LOCAL_ROOT + "/register.sh", "w")
  shScriptFile.write(shScript)
  logger.info("Making executable...")
  # From https://stackoverflow.com/questions/12791997/how-do-you-do-a-simple-chmod-x-from-within-python
  st = os.stat(LOCAL_ROOT + "/register.sh")
  os.chmod(LOCAL_ROOT + "/register.sh", st.st_mode | stat.S_IEXEC)

  logger.info("")
  logger.info("Generated unit files to start 2Keys on startup!")
  logger.info("To install the services for use, please run:")
  logger.info(" sudo bash ./.2Keys/register.sh register")
  logger.info("For help on how to use the script:")
  logger.info(" sudo bash ./.2Keys/register.sh help")
