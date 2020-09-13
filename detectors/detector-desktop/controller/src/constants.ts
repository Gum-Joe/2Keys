import { join } from "path";

export const VAGRANT_DEFAULT_INSTALL_PATH = "C:\\HashiCorp\\Vagrant\\bin";
export const VBOX_DEFAULT_INSTALL_PATH = "C:\\Program Files\\Oracle\\VirtualBox";
export const VIRTUALBOX_NAME = "VirtualBox";
export const VIRTUALBOX_EXECUTABLE_NAME = "VirtualBox Install Folder";
export const VAGRANT_NAME = "Vagrant";
export const VAGRANT_EXECUTABLE_NAME = "Vagrant Install Folder";

/** Root where assets are stored */
export const ASSETS_ROOT = join(__dirname, "../assets");
export const VM_ASSETS_ROOT = join(ASSETS_ROOT, "vm");
export const VAGRANT_FILE_TEMPLATE = "Vagrantfile.template";