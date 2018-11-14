# File to use IOCTL to reserve a keyboard
import evdev
import os
from util import Logger

logger = Logger("evdev")

# @param pathRaw: Path to keyboard (i.e. /dev/input/.....)
def lock_keyboard(pathRaw):
  logger.info("Grabbing and locking device {}...".format(pathRaw))
  # Resolve links
  keyboard_path = os.path.realpath(pathRaw)
  devices = [evdev.InputDevice(path) for path in evdev.list_devices()]
  picked_device = None # Returned
  for device in devices:
    if device.path == keyboard_path:
      logger.info("Got device.")
      picked_device = device
      picked_device.grab()
      break
  return picked_device
