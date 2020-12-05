import unittest
from twokeys_utils import getDetectorProjectStorage
from os.path import join
import os

class TestGetStorage(unittest.TestCase):
	def testGetDetectorProjectStorage(self):
		TEST_PROJECT = "/twokeys/projects/HelloWorld"
		TEST_UUID = "0000"
		self.assertEqual(
			getDetectorProjectStorage(TEST_PROJECT, TEST_UUID),
			join(TEST_PROJECT, f"detectors{os.path.sep}device-" + TEST_UUID)
		)

if __name__ == '__main__':
    unittest.main()