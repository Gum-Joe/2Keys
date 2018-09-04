"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @overview Server starter for 2Keys
 */
const express_1 = __importDefault(require("express"));
const api_1 = __importDefault(require("./routes/api"));
const logger_1 = __importDefault(require("./util/logger"));
const constants_1 = require("./util/constants");
const app = express_1.default();
const logger = new logger_1.default({
    name: "server",
});
app.use("/api", api_1.default);
const server = (port = constants_1.DEFAULT_PORT) => {
    app.listen(port, () => {
        logger.info("Server now listenning");
    });
};
exports.default = server;
//# sourceMappingURL=index.js.map