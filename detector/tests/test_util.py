import unittest
import os

# Setup ENV
os.environ["2KEYS_TEST"] = "true"

from twokeys.util import load_config, logger


class TestUtil(unittest.TestCase):

    def setUp(self):
        os.chdir("./detector/tests/mock")
    
    def test_load_config(self):
        config = load_config()
        self.assertEqual(config["name"], "MOCK")
        self.assertTrue("keyboards" in config)
        self.assertTrue("keyboard" in config["keyboards"])
        self.assertTrue("path" in config["keyboards"]["keyboard"])
        self.assertEqual(config["keyboards"]["keyboard"]["path"], "/dev/input/by-id/akbd")

    
if __name__ == '__main__':
    unittest.main()
