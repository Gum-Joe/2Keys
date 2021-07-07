"""
Tests provisioning of client
"""
import json
from twokeys.util.constants import KEYBOARD_MAP_FILENAME, PROJECT_MAP_FILENAME, SCHEMA_KDB_MAP, SCHEMA_PROJECTS_MAP, TWOKEYS_FIXED_HOME_CONFIG
from twokeys.provision import provision, FatalProvisioningException
from jsonschema import validate
import unittest
import os
import sys

# Setup ENV
os.environ["2KEYS_TEST"] = "true"

MOCK_PROVISION_CONFIG = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "./mock/client-provision.yml")

MOCK_ROOT = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "./mock/provision")


class TestProvisioning(unittest.TestCase):

	def test_provisioning(self):
			"""
			Runs the client provisioner and checks that all files are created and are of the correct schema
			"""
			provision(file=MOCK_PROVISION_CONFIG)
			# Check files
			keyboardMap = os.path.join(MOCK_ROOT, "config", KEYBOARD_MAP_FILENAME)
			projectMap = os.path.join(MOCK_ROOT, "projects", PROJECT_MAP_FILENAME)
			self.assertTrue(
				os.path.exists(
					keyboardMap
				)
			)
			self.assertTrue(
				os.path.exists(
					projectMap
				)
			)
			# Also check for home fixed config
			self.assertTrue(
				os.path.exists(
					TWOKEYS_FIXED_HOME_CONFIG
				)
			)
			# Check content
			self.assertEqual(open(TWOKEYS_FIXED_HOME_CONFIG, "r").read(),
			                 open(MOCK_PROVISION_CONFIG, "r").read())
			# Validate against schemas
			# Validate KDB map
			keyboardMapLoaded = json.load(open(keyboardMap, "r"))
			keyboardMapSchema = json.load(open(SCHEMA_KDB_MAP, "r"))
			validate(keyboardMapLoaded, keyboardMapSchema)
			# Validate Projects map
			projectMapLoaded = json.load(open(projectMap, "r"))
			projectMapSchema = json.load(open(SCHEMA_PROJECTS_MAP, "r"))
			validate(projectMapLoaded, projectMapSchema)

	def test_provisioning_io_errors(self):
		"""
			Runs the client provisioner and checks for I/O errors (i.e. those related to loading configs)
		"""
		# Case 1: Missing file
		with self.assertRaisesRegexp(FatalProvisioningException, "Could not read provided config"):
			provision(file="not-a-file.yml")
		
		# Case 2: Files that can't be read, namely root owned files
		with self.assertRaisesRegexp(FatalProvisioningException, "Could not read provided config"):
			provision(file="/etc/sudoers")
		
		# Case 3: No file provided (on CLI)
		with self.assertRaisesRegexp(FatalProvisioningException, "You must provide a file"):
			provision(file=None)  # None is what CLI will provide

	def test_provisioning_config_errors(self):
		"""
			Runs the client provisioner and checks for config validation errors
		"""
		# Case 1: blank config
		with self.assertRaisesRegexp(FatalProvisioningException, "No config given"):
			provision(file=os.path.join(
											os.path.dirname(os.path.realpath(__file__)), "./mock/blank.yml"))
		
		# Case 2: invalid config
		with self.assertRaisesRegexp(FatalProvisioningException, "Your config file was invalid"):
			provision(file=os.path.join(
											os.path.dirname(os.path.realpath(__file__)), "./mock/client-provision-invalid.yml"))


if __name__ == '__main__':
	unittest.main()
