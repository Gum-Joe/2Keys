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
 * Create Project config
 * @packageDocumentation
 */

import { CreateProject } from "../protobuf/project_pb";
import { Command, BaseTwoKeysForCommands, CommandFactory } from "../../common";

/**
 * Create a new project, creating the folder and the config file for it
 */
const createProject: Command<CreateProject.AsObject, Promise<void>> = async (twokeys: BaseTwoKeysForCommands, config: CreateProject.AsObject): Promise<void> => {
	const { logger } = twokeys;
	logger.status("Creating new project");
};

export default CommandFactory.wrapCommand(createProject, "createProject");