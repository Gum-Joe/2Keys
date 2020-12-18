"""
Tests provisioning of client
"""
import json
from twokeys.util.constants import KEYBOARD_MAP_FILENAME, PROJECT_MAP_FILENAME, SCHEMA_KDB_MAP, SCHEMA_PROJECTS_MAP
from twokeys.provision import provision
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
			# Validate against schemas
			# Validate KDB map
			keyboardMapLoaded = json.load(open(keyboardMap, "r"))
			keyboardMapSchema = json.load(open(SCHEMA_KDB_MAP, "r"))
			validate(keyboardMapLoaded, keyboardMapSchema)
			# Validate Projects map
			projectMapLoaded = json.load(open(projectMap, "r"))
			projectMapSchema = json.load(open(SCHEMA_PROJECTS_MAP, "r"))
			validate(projectMapLoaded, projectMapSchema)

	def test_provisioning(self):
		"""
			Runs the client provisioner and checks that all files are created and are of the correct schema
			"""
		provision(file=MOCK_PROVISION_CONFIG)
		# Check files
		keyboardMap = os.path.join(MOCK_ROOT, "config", KEYBOARD_MAP_FILENAME)
		projectMap = os.path.join(MOCK_ROOT, "projects", PROJECT_MAP_FILENAME)



if __name__ == '__main__':
	unittest.main()
