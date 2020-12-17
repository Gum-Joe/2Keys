
from os import makedirs, mkdir
import os
from os.path import join
from ..util.constants import BLANK_KEYBOARD_MAP, KEYBOARD_MAP_FILENAME, SCHEMA_PROVISIONING
from twokeys_utils import Logger
from ..util.config import load_config, load_config_from_file
from jsonschema import validate
from jsonschema.exceptions import SchemaError, ValidationError
import json
from typing import Any, Union, Dict

logger = Logger("provision")

class FatalProvisioningException(Exception):
	"""Used to tell caller (CLI) there was an error and to quit with non-exit code"""

def validateConfig(configFile: Union[str, None]) -> Dict[str, Any]:
	"""Ensures the config provided to us exists and is valid. Returns the parsed config."""
	logger.info("Validating config...")
	logger.debug(configFile)
	if configFile == False:
		logger.err("Error: You must provide a file with all options as input to this command.  Rerun this command with the --help option for more information.")
		raise FatalProvisioningException("Error: You must provide a file with all options as input to this command.")
	# READ!logger.debug("Reading config")
	try:
		config = load_config_from_file(configFile)
	except IOError as err:
		logger.err("Error reading config!")
		logger.err(err)
		raise FatalProvisioningException("Could not read provided config")

	# Config now loaded
	try:
		logger.debug("Reading schema for validation")
		loadedSchemaRAW = open(SCHEMA_PROVISIONING, "r")
		parsedSchema = json.load(loadedSchemaRAW)

		# Validate logger.debug("Validating...")
		if config is None:
			logger.err("No config given when the file was loaded!")
			raise FatalProvisioningException("No config given when it was loaded!")

		validate(config, parsedSchema)

		# And if that's fine:
		logger.debug("Schema valid!")
		return config
	# Handle exception
	except IOError as err:
		logger.err("Internal error reading schema to validate user-provided config!")
		logger.err("This may be a problem with your 2Keys install.  Please reinstall 2Keys, or file an issue.")
		logger.err(err)
		raise FatalProvisioningException("Internal error reading schema to validate user-provided config!")
	except ValidationError as err:
		logger.err("Your config file was invalid!")
		logger.err("Please ensure it is valid and has all required fields.")
		logger.err(err.message)
		raise FatalProvisioningException("Your config file was invalid!")
	except SchemaError as err:
		logger.err("Internal error validating internal config schema!")
		logger.err("This may be a problem with your 2Keys install.  Please reinstall 2Keys, or file an issue.")
		logger.err(err)
		raise FatalProvisioningException("Internal error reading schema to validate user-provided config!")
	
	# ALl good!


def provision(**kargs):
	"""Provisions a new client, creating the files so it can then be added to a project as a detector.
  Works by creating index for keyboards (/dev/input -> client config keyboards) and projects and a directory structure to store files in.

  Only config files are supported at this time.  These config files are created by the controller from the main server-side config

  The follow structure is created (assume / is the set root, usually /vagrant):
  ```
  /
  |--/config
    |--client.yml (provided by 2Keys)
    |--keyboard-index.yml
  |--/projects
    |--project-map.yml
  ```
  """
	logger.info("Provisioning a new client")
	config = validateConfig(kargs["file"])
	logger.info("Schema validation succesful. Starting install...")

	# STEP 1: Create directors
	logger.info("============================")
	logger.info("	BEGIN PROVISION")
	logger.info("============================")
	logger.info("STEP 1: Creating directories...")
	if not os.path.exists(config["client"]["roots"]["config"]):
		makedirs(config["client"]["roots"]["config"])  # For configs
		logger.info("Created directory " + config["client"]["roots"]["config"] + " to store configs in.", )

	if not os.path.exists(config["client"]["roots"]["projects"]):  # For projects storage
		logger.info("Created directory " + config["client"]["roots"]["projects"] + " to store configs in.", )
	
	# STEP 2: Create index
	logger.info("STEP 2: Creating keyboard and project indexes...")
	# Create keyboard index
	logger.info("Generating a blank keyboard index...")
	logger.debug("Generating JSON...")
	keyboardMap = open(join(config["client"]["roots"]["config"], KEYBOARD_MAP_FILENAME), "w")
	jsonKDBIndex = json.dump(BLANK_KEYBOARD_MAP, keyboardMap) # TODO: Validate all props are there against JSON schema in tests!
	logger.info("Keyboard index generated.")
