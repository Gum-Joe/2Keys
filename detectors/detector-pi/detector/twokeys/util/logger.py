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
# Logger for 2Keys Python scripts
import colorful
import sys
import os
# string name: Name of module logging
class Logger:
  def __init__(self, name):
    self.silent = False
    self.isDebug = False
    self.name = name
    if "--debug" in sys.argv or os.getenv("DEBUG", "false").lower() == "true":
      self.isDebug = True
    if "--silent" in sys.argv or os.getenv("2KEYS_TEST", "False").lower() == "true":
      self.silent = True
  def info(self, text):
    if not self.silent:
      print(colorful.magenta(self.name) + " " + colorful.green("info") + " " + str(text))
  def debug(self, text):
    if not self.silent and self.isDebug:
      print(colorful.magenta(self.name) + " " + colorful.cyan("debug") + " " + str(text))
  def err(self, text):
    if not self.silent:
      print(colorful.magenta(self.name) + " " + colorful.red("err") + " " + str(text))
  def warn(self, text):
    if not self.silent:
      print(colorful.magenta(self.name) + " " + colorful.yellow("warn") + " " + str(text))
    
