from watch_keyboard import Keyboard
import yaml

config_file = open("config.yml", "r")
config = yaml.load(config_file.read())
keyboard = Keyboard(config["keyboards"]["keyboard"])
