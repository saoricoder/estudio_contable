"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const app_1 = require("../server/src/app");
function handler(req, res) {
    // Express apps are (req, res) handlers
    return (0, app_1.app)(req, res);
}
