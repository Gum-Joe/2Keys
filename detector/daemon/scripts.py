import sys
import os
import pystache
from util.logger import Logger
from util.constants import DAEMON_TEMPLATE_PATH, SCRIPTS_ROOT, LOCAL_ROOT

logger = Logger("daemon")
# Generates a systemd unit file
# Name: Name of 2Keys project
# Keyboards: Array of keyboard names
def generate_daemon(name, keyboards):
  logger.info("Creating systemd unit scripts...")
  template = open(DAEMON_TEMPLATE_PATH, "r").read() # Open template
  shScript = """
  # Script to auto add services
  # Please run using sudo
  echo Reloading daemons....
  systemctl daemon-reload
  """ # Used so we don't have to raise this process
  shStarters = """
  # Start them
  systemctl daemon-reload
  """
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
      logger.info("Making local root ./.2Keys")
      os.makedirs(LOCAL_ROOT)
    
    UNIT_FILE_NAME = "2Keys-%s.service" % keyboard
    logger.info("Creating unit file {}...".format(UNIT_FILE_NAME))
    unitFile = open(LOCAL_ROOT, "/" + UNIT_FILE_NAME, "w")
    logger.info("Writing...")
    unitFile.write(script)   
    logger.info("Adding command to a .sh script to add service/unit script...")
    # Add command to add service
    shScript += """
    echo Adding script for {}...
    echo Chmodding with 644...
    chmod {}
    systemctl enable {}
    """.format(name, LOCAL_ROOT + "/" + UNIT_FILE_NAME, "/" + UNIT_FILE_NAME)
    # Add start command
    shStarters += """
    echo Starting {}...
    systemctl start {}
    """.format(name, UNIT_FILE_NAME)
  logger.info("Creating unit files/service register script...")
  script = shScript + "\n" + shStarters
  logger.info("Writing...")
  open(LOCAL_ROOT + "register.sh", "w").write(script)

  
