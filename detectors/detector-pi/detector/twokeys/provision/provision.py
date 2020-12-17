
from ..util.constants import SCHEMA_PROVISIONING
from twokeys_utils import Logger
from ..util.config import load_config, load_config_from_file
from jsonschema import validate
from jsonschema.exceptions import SchemaError, ValidationError
import json
from typing import Any

logger = Logger("provision")

class FatalProvisioningException(Exception):
	"""Used to tell caller (CLI) there was an error and to quit with non-exit code"""

def validateConfig(configFile: str | False) -> dict[str, Any]:
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
	config = validateConfig(kargs)
	logger.info("Schema validation succesful. Starting install...")
	

