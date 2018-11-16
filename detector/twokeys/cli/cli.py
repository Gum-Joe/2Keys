#!/usr/bin/env python3
# CLI for 2Keys
# I'm just making my own since that's easier for me to understand
import click
import sys
from ..watcher import Keyboard
from ..util import Logger, load_config
from ..add_keyboard import gen_async_handler, add_keyboard
from ..init import init as init_cli
from ..sync import sync_config

logger = Logger("cli")

@click.group()
def cli():
  return

@cli.command()
@click.option("--address", "-a", help="Specify the IPv4 address of the server")
@click.option("--port", "-p", help="Specify the port the server is running on")
def init(address, port):
    init_cli(address=address, port=port)

@cli.command()
def sync():
    logger.warn("This will overwrite the copy of the config on the detector. Proceed? [Y/n]")
    proceed = input("").lower()
    if proceed == "y":
      sync_config()

@cli.command()
@click.argument("keyboard")
def add(keyboard):
  if keyboard == "":
    logger.err("Please provide a keyboard to add.")
    exit()
  add_keyboard(keyboard, gen_async_handler)

@cli.command()
@click.argument("keyboard")
@click.option("-n", "--no-lock", is_flag=True, help="Don't lock the keyboard")
def watch(keyboard, no_lock):
  if keyboard == "":
    logger.err("Please provide a keyboard to watch.")
    exit()
  
  # Keyboard specified, watch it
  config = load_config()
  keyboard = Keyboard(config["keyboards"][keyboard], keyboard)
  if not no_lock:
    try:
      keyboard.lock() # Grabs keyboard
      keyboard.watch_keyboard()
    except (KeyboardInterrupt, SystemExit, OSError):
      keyboard.unlock()
      exit(0)
  else:
    keyboard.watch_keyboard()
