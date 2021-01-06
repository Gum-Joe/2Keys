# Base logger for 2Keys

"""
Copyright 2020 Kishan Sambhi

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
# Logger for 2Keys Python scripts
import colorful
import sys
import os
import json
# string name: Name of module logging
class Logger:
  """Logger class. Used for printing messages.
  
  The following properties can be set on a created logger object:
  - Logger.silent: silences the logger and stops any output for printing (use --silent on CLI)
  - Logger.isDebug: print debug output (use --debug on CLI)
  - Logger.name: Prefix before all logging messages
  - Logger.json: Print in JSON mode (use --json on CLI)
  """

  def __init__(self, name):
    # Define props
    self.silent = False
    self.isDebug = False
    self.name = name
    self.useJSON = False
    if "--debug" in sys.argv or os.getenv("DEBUG", "false").lower() == "true":
      self.isDebug = True
    if "--silent" in sys.argv or os.getenv("2KEYS_TEST", "False").lower() == "true":
      self.silent = True
    if "--json" in sys.argv or os.getenv("2KEYS_JSON", "False").lower() == "true":
      self.useJSON = True
  def __log(self, level: str, levelColour: str, text):
    """
    Logs a string to console
    Parms:
    - levelWithColour: Coloured string to print as the level
    - text: Text to print
    """
    if not self.silent:
      if not self.useJSON:
        print(colorful.magenta(self.name) + " " + getattr(colorful, levelColour)(level) + " " + str(text))
      else:
        print(json.dumps({
          "prefix": self.name,
          "level": level,
          "message": str(text),
        }))
  def info(self, text):
    self.__log("info", "green", text)
  def debug(self, text):
    if self.isDebug:
      self.__log("debug", "cyan", text)
  def err(self, text):
    self.__log("err", "red", text)
  def warn(self, text):
    self.__log("warn", "yellow", text)
    
