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
app.use("/api", api)

const server: (port: number) => void = (port: number = DEFAULT_PORT) => {
  app.listen(port, () => {
    logger.info("Server now listenning on port " + port);
  });
};

export default server;