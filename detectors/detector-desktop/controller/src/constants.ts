import { join } from "path";

// Software registry related constants
export const VAGRANT_DEFAULT_INSTALL_PATH = "C:\\HashiCorp\\Vagrant\\bin\\vagrant.exe";
/** Install **FOLDER** Of VBox */
export const VBOX_DEFAULT_INSTALL_PATH = "C:\\Program Files\\Oracle\\VirtualBox";
export const VIRTUALBOX_NAME = "VirtualBox";
export const VIRTUALBOX_EXECUTABLE_NAME = "VirtualBox Install Folder";
export const VAGRANT_NAME = "Vagrant";
export const VAGRANT_EXECUTABLE_NAME = "Vagrant Install Folder";
/** Controls the root mount point for stuff into the VM, i.e. where configs, Vagrantfile and ansible scripts will all be mounted.  MUST NOT END IN A SLASH (`/`) */
export const VAGRANT_MOUNT_POINT = "/vagrant";
/**
 * Where configs will be stored on the client
 */
// TODO: Move to shared folder so python can also access this
export const VM_MOUNT_CONFIGS = VAGRANT_MOUNT_POINT + "/config";
/**
 * Where projects will be stored on the client
 */
// TODO: Move to shared folder so python can also access this
export const VM_MOUNT_PROJECTS = VAGRANT_MOUNT_POINT + "/projects";
/**
 * VM Mount location of client config from controller ({@link ClientConfigHere}).
 * 
 * Not to be confused with the client provisioning config
 */
export const VM_MOUNT_CLIENT_CONFIG = VM_MOUNT_CONFIGS + "/client.yml";
/**
 * Storage path for provision script, relative to root.
 */
// TODO: Move to a common package so Python also can access this
export const PROVISION_CONFIG_STORAGE = "config/provision.yml";

/** Root where assets are stored */
export const ASSETS_ROOT = join(__dirname, "../assets");
export const VM_ASSETS_ROOT = join(ASSETS_ROOT, "vm");
export const VAGRANT_FILE_TEMPLATE = "Vagrantfile.template";
export const VAGRANT_FILE_DEST = "Vagrantfile";
export const VM_LAUNCH_VBS_FILE_TEMPLATE = "template.launch.vbs";
export const VM_LAUNCH_BAT_FILE_TEMPLATE = "template.launch.bat";
export const VM_LAUNCH_VBS_FILE_DEST = "launch.vbs";
export const VM_LAUNCH_BAT_FILE_DEST = "launch.bat";