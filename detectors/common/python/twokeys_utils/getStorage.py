"""
Copyright 2020 Kishan Sambhi

This file is part of 2Keys.

2Keys is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

2Keys is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
"""
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
	return join(projectDir, DETECTOR_PROJECT_STORAGE_RELATIVE_ROOT, DETECTOR_PROJECT_STORAGE_UUID_PREFIX + detectorUUID)