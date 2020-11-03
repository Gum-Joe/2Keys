from os.path import join
from .constants import DETECTOR_PROJECT_STORAGE_RELATIVE_ROOT, DETECTOR_PROJECT_STORAGE_UUID_PREFIX

def getDetectorProjectStorage(projectDir: str, detectorUUID: str):
	"""
	Fuction that returns the location of files related to a detector attached to a project,
	stored the project dir

	Is equal to:
	
	/path/to/project/detectors/device-uuid/

	E.g. getDetectorProjectStorage("/vagrant/projects/SomeProject", "7e0c2378-5849-4c23-92f7-eb9d24e608f0") ->
	/vagrant/projects/SomeProject/detectors/device-7e0c2378-5849-4c23-92f7-eb9d24e608f0/
	"""
	join(projectDir, DETECTOR_PROJECT_STORAGE_RELATIVE_ROOT, DETECTOR_PROJECT_STORAGE_UUID_PREFIX + detectorUUID)