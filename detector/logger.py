# Logger for 2Keys Python scripts
import colorful
# string name: Name of module logging
class Logger:
  def __init__(self, name):
    self.name = name
  
  def info(self, text):
    print(colorful.magenta(self.name) + " " + colorful.green("info") + " " + text)

  def debug(self, text):
    print(colorful.magenta(self.name) + " " + colorful.cyan("debug") + " " + text)
  def err(self, text):
    print(colorful.magenta(self.name) + " " + colorful.red("err") + " " + text)
  def warn(self, text):
    print(colorful.magenta(self.name) + " " + colorful.yellow("warn") + " " + text)
    
