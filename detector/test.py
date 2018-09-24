from watch_keyboard import Keyboard
import yaml

config_file = open("config.yml", "r")
config = yaml.load(config_file.read())
print(config)
print(config["keyboards"])
print(config["keyboards"]["keyboard"])
keyboard = Keyboard(config["keyboards"]["keyboard"])
