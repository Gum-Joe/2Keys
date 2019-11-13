/**
Copyright 2018 Kishan Sambhi

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
*/

/**
 * @overview Server starter for 2Keys
 */
import express from "express";
import bodyParser from "body-parser";
import api from "./routes/api";
import Logger from "./util/logger";
import { DEFAULT_PORT } from "./util/constants";

const app = express();
const logger: Logger = new Logger({
  name: "server",
});

app.use(bodyParser.json());
app.use("/api", api);

const server: (port: number) => void = (port: number = DEFAULT_PORT) => {
  app.listen(port, () => {
    logger.info("Server now listenning on port " + port);
  });
};

export default server;
export { app };
