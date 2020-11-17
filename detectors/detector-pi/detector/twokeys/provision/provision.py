from detectors.common.python.twokeys_utils.logger import Logger

logger = Logger("provision")

def provision(**kargs):
	"""Provisions a new client"""
	logger.info("Provisioning a new client")
	