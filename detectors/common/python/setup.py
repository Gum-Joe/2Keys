# Setup script
# https://python-packaging.readthedocs.io/en/latest/everything.html
from setuptools import setup, find_packages

def readme():
    with open("./README.md") as f:
        return f.read()

def get_required():
  with open("./requirements.txt") as f:
    packages = []
    for line in f:
      if not line[0] == "#" and not line == "" and not line[0:2] == "-i" and not line == "\n":
        packages.append(line.rstrip("\n").split("==")[0])
    
    return packages

setup(name="2Keys-utils",
      version="0.4.0",
      description="Common Python Code for 2Keys detectors written in Python",
      long_description=readme(),
      url="https://github.com/Gum-Joe/2Keys",
      author="Gum-Joe",
      author_email="kishansambhi@hotmail.co.uk",
      keywords="hid ahk autohotkey macros 2cdkeyboard keyboards",
      license="GPLv3",
      packages=["twokeys_utils"], # Might include tests!
      install_requires=get_required(),
      classifiers=[
          "Development Status :: 2 - Pre-Alpha",
          "Operating System :: POSIX :: Linux",
          "Programming Language :: Python :: 3.5",
          "License :: OSI Approved :: GNU General Public License v3 (GPLv3)"
      ],
      include_package_data=True,
      zip_safe=False,
)
