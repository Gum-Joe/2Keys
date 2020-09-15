/**
 * @license
 * Copyright 2020 Kishan Sambhi
 *
 * This file is part of 2Keys.
 *
 * 2Keys is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 2Keys is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * Updates templates to create the files the VM uses
 * @packageDocumentation
 */

import { TwoKeys, TWOKEYS_ADDON_TYPE_DETECTOR } from "@twokeys/addons";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { ClientConfigHere } from "../../../config";
import { VAGRANT_FILE_TEMPLATE, VAGRANT_FILE_DEST } from "../../../constants";
import Handlebars from "handlebars";

/** Parameters for the Vagrantfile template */
export interface VagrantFileTemplateParams {
	/** String with all vb.customize USB passthrough handlers (separated by `\n`) */
	twokeys_insert_usb_passthrough: string;
	/**
	 * Ansible scripts to setup projects, separated by `\n`
	 * 
	 * Format:
	 * ```ruby
	 * config.vm.provision "ansible_local" do |ansible|
   * 	ansible.playbook = "ansible/client/provision.yml"
   * end
	 * ```
	 */
	twokeys_insert_ansible_provising: string;
}

export const USB_PASSTHROUGH_TEMPLATE =
	"    vb.customize ['usbfilter', 'add', '0', '--target', :id, '--name', '{{ filter_name }}', '--vendorid', '{{ kbd_vendorid }}', '--productid', '{{ kbd_productid }}']";

/** @see USB_PASSTHROUGH_TEMPLATE */
export interface UsbPassthroughParams {
	filter_name: string;
	kbd_vendorid: string;
	kbd_productid: string;
}

// TODO: Adjust script param to be relative
export const ANSIBLE_SCRIPT_TEMPLATE = 
	`config.vm.provision "ansible_local" do |ansible|
    ansible.playbook = "/vagrant/{{ script }}"
  end`;

/** @see ANSIBLE_SCRIPT_TEMPLATE */
export interface AnsibleScriptParams {
	script: string;
}

/** Generates a Vagrantfile from the template (see assets/vm/Vagrantfile.template) */
export default async function updateVagrantFile(twokeys: TwoKeys<TWOKEYS_ADDON_TYPE_DETECTOR>, config: ClientConfigHere): Promise<void> {
	twokeys.logger.substatus("Updating Vagrantfile");
	const template = await readFile(join(twokeys.properties.clientRoot, VAGRANT_FILE_TEMPLATE));

	twokeys.logger.debug("Generating USB passthrough");
	const usbPassthrough = config.keyboards.map(keyboardFilter => Handlebars.compile<UsbPassthroughParams>(USB_PASSTHROUGH_TEMPLATE)({
		filter_name: keyboardFilter.filterName,
		kbd_productid: keyboardFilter.productID,
		kbd_vendorid: keyboardFilter.vendorID,
	})).join("\n");

	twokeys.logger.debug("Generating Ansible Provising scripts");
	const ansibleScripts = config.projects.map(project => Handlebars.compile<AnsibleScriptParams>(ANSIBLE_SCRIPT_TEMPLATE)({
		script: project.ansibleProvisioner,
	})).join("\n");

	const compiledTemplate = Handlebars.compile<VagrantFileTemplateParams>(template);
	const vagrantFile = compiledTemplate({
		twokeys_insert_usb_passthrough: usbPassthrough,
		twokeys_insert_ansible_provising: ansibleScripts
	});

	twokeys.logger.debug("Writing Vagrantfile");
	await writeFile(join(twokeys.properties.clientRoot, VAGRANT_FILE_DEST), vagrantFile);
	// DONE!
}