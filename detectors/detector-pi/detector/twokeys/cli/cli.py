#!/usr/bin/env python3
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
# CLI for 2Keys
# I'm just making my own since that's easier for me to understand
import click
import sys
from ..watcher import Keyboard
from ..util import Logger, load_project_config, constants
from ..add_keyboard import gen_async_handler, add_keyboard, link_keyboard
from ..init import init as init_cli
from ..sync import sync_config
from ..daemon import generate_daemon
from ..provision import provision, FatalProvisioningException

logger = Logger("cli")

@click.group()
@click.option("--debug", is_flag=True, help="Enable debugging")
@click.option("--silent", is_flag=True, help="Don't log")
def cli(debug, silent):
  return

@cli.command()
@click.option("--address", "-a", help="Specify the IPv4 address of the server")
@click.option("--port", "-p", help="Specify the port the server is running on")
@click.option("--no-path-request", is_flag=True, help="Don't run the interactive keyboard detector (assumes all /dev/input/ paths have already been put into the config on the server)")
def init(address, port, no_path_request):
  init_cli(address=address, port=port, no_path_request=no_path_request)

@cli.command()
@click.option("-y", "--yes", is_flag=True, help="Don't ask for prompts")
def sync(yes):
    logger.warn("This will overwrite the copy of the config on the detector. Proceed? [Y/n]")
    proceed = ""
    if yes:
      logger.warn("-y flag was given.  Proceeding...")
      proceed = "y"
    else:
      # ASK
      proceed = input("").lower()
    # DO IT
    if proceed == "y":
      sync_config()

@cli.command()
@click.argument("keyboard", default="")
@click.option(
  "--inputs-path",
  "-i",
  help="Provide an alternative path to use as the source of keyboard input 'files' (default: /dev/input/by-id)",
  default=constants.KEYBOARDS_PATH_BASE
)
def add(keyboard, inputs_path):
  add_keyboard(keyboard, gen_async_handler, inputs_path)

@cli.command("link")
@click.argument("uuid", required=True)
#@click.argument("path", default="")
@click.option(
  "--by-detection",
  is_flag=True,
  help="Link the UUID of a keyboard in the config to a physical input device by detecting a keypress on the right device"
)
@click.option(
  "--inputs-path",
  "-i",
  help="Provide an alternative path to use as the source of keyboard input 'files' (default: /dev/input/by-id)",
  default=constants.KEYBOARDS_PATH_BASE
)
def linkKeyboard(uuid, by_detection, inputs_path):
  link_keyboard(uuid, None, inputs_path, by_detection=by_detection)

@cli.command()
@click.argument("keyboard")
@click.option("-n", "--no-lock", is_flag=True, help="Don't lock the keyboard")
def watch(keyboard, no_lock):
  if keyboard == "":
    logger.err("Please provide a keyboard to watch.")
    exit()
  
  # Keyboard specified, watch it
  config = load_project_config()
  keyboard = Keyboard(config["keyboards"][keyboard], keyboard, config, no_lock=no_lock)
  if not no_lock:
    keyboard.watch_keyboard()
    """try: # Now handled by the watcher
      #keyboard.lock() # Grabs keyboard
      keyboard.watch_keyboard()
    except (KeyboardInterrupt, SystemExit, OSError) as err:
      logger.err("Error encountered. Exiting...")
      logger.err(str(err))
      keyboard.unlock()
      exit(0)"""
  else:
    keyboard.watch_keyboard()
  
@cli.command("provision")
@click.option("-f", "--file", type=str, help="Config file to use. Must specify all options.")
def provisionClient(file):
  """Provisions a new client, creating the files so it can then be added to a project as a detector.
  Works by creating index for keyboards (/dev/input -> client config keyboards) and projects and a directory structure to store files in.

  See provision() docs for more info.
  """
  # Run provision
  try:
    provision(file=file)
  except FatalProvisioningException:
    #logger.err("2Keys command failed: see above for why.")
    exit(1)

  

# Command to generate daemons
@cli.command()
@click.argument("keyboards", nargs=-1, required=False)
def daemon_gen(keyboards):
  logger.info("Generating daemon files...")
  config = load_project_config()
  keyboard_list = config["keyboards"].keys()
  if keyboards != ():
    # Use args instead
    keyboard_list = keyboards
  generate_daemon(config["name"], config["keyboards"].keys())

@cli.command("version")
def getversion():
  """Shows version info"""
  print(constants.VERSION)

