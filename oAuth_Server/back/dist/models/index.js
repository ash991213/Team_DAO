"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const config_1 = __importDefault(require("../config/config"));
const verifyId_model_1 = __importDefault(require("./user/verifyId.model"));
const dataNeeded_model_1 = __importDefault(require("./webSite/dataNeeded.model"));
const mode = process.env.NODE_ENV === 'production' ? process.env.NODE_ENV : 'development';
const config = config_1.default[mode];
const sequelize = new sequelize_typescript_1.Sequelize(Object.assign({}, config));
sequelize.addModels([verifyId_model_1.default]);
sequelize.addModels([dataNeeded_model_1.default]);
exports.default = sequelize;
