# Config loader#
import yaml
from .constants import CONFIG_FILE

def load_config():
	config_file = open(CONFIG_FILE, "r")
	return yaml.load(config_file.read())