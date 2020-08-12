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
 * Constants
 * @packageDocumentation
 */
import { join } from "path";
import { homedir } from "os";

/**
 * Root Home where all 2Keys stuff is stored
 */
export const TWOKEYS_HOME = join(homedir(), ".2Keys");
/** Root where all config related items are stored */
export const TWOKEYS_CONFIG_HOME = join(TWOKEYS_HOME, "config");
/** Default location of 2Keys main config (see interface {@link ServerConfig}).  Is the only fixed config location. */
export const TWOKEYS_MAIN_CONFIG_DEFAULT_PATH = join(TWOKEYS_CONFIG_HOME,  "config.yml");
/** root dir for the storage of detector configs */
export const TWOKEYS_DETECTOR_CONFIG_ROOT = join(TWOKEYS_HOME, "detectors");
// NOTE: Check @twokeys/addons for default registry root
