from watch_keyboard import Keyboard
import yaml

config_file = open("config.yml", "r")
config = yaml.parse(config_file.read())
keyboard = Keyboard(config["keyboard"]["keyboard"])
