# Setup script
# https://python-packaging.readthedocs.io/en/latest/everything.html
from setuptools import setup, find_packages


def readme():
    with open("./README.md") as f:
        return f.read()

def get_required():
  with open("./required.txt") as f:
    packages = []
    for line in f:
      if not line[0] == "#" and not line == "":
        packages.append(line.rstrip("\n"))
    
    return packages

setup(name="2Keys",
      version="0.3.7",
      description="A easy to setup second keyboard, designed for everyone. ",
      long_description=readme(),
      url="https://github.com/Gum-Joe/2Keys",
      author="Gum-Joe",
      author_email="kishansambhi@hotmail.co.uk",
      keywords="hid ahk autohotkey macros 2cdkeyboard keyboards",
      license="GPLv3",
      packages=find_packages(),
      install_requires=get_required(),
      classifiers=[
          "Development Status :: 2 - Pre-Alpha",
          "Operating System :: POSIX :: Linux",
          "Programming Language :: Python :: 3.5",
          "License :: OSI Approved :: GNU General Public License v3 (GPLv3)"
      ],
      include_package_data=True,
      entry_points={
        "console_scripts": ["2Keys = twokeys.cli:cli"]
      },
      zip_safe=False,

      # For bdist
      package_data={
        "package": ["assets/*"]
      }
)
