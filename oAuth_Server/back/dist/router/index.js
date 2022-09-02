"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const app_1 = __importDefault(require("./app/app"));
const login_1 = __importDefault(require("./user/login"));
const user_1 = __importDefault(require("./user/user"));
const verifyEmail_1 = __importDefault(require("./verify/verifyEmail"));
const route = express.Router();
route.use('/app', app_1.default);
route.use('/login', login_1.default);
route.use('/user', user_1.default);
route.use('/verifyEmail', verifyEmail_1.default);
exports.default = route;
