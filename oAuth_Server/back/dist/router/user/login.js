"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const crypto_1 = __importDefault(require("crypto"));
const web3_1 = __importDefault(require("../../web3"));
const verifyId_model_1 = __importDefault(require("../../models/user/verifyId.model"));
const index_1 = __importDefault(require("../../models/index"));
console.log(index_1.default);
const router = express_1.default.Router();
router.post('/authorize', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, restAPI, redirectURI } = req.body;
    console.log(req.body);
    const userhash = email + password;
    const hash = crypto_1.default.createHash('sha256').update(userhash).digest('base64');
    const deploy = yield (0, web3_1.default)();
    const result = yield deploy.methods.getUser(hash).call();
    const gender = result[0];
    const name = result[1];
    const age = result[2];
    const address = result[3];
    const mobile = result[4];
    const userEmail = result[5];
    const dbUser = yield verifyId_model_1.default.findOne({
        where: {
            hashId: {
                [sequelize_1.Op.eq]: hash,
            },
        },
    });
    const code = 'asdf';
    try {
        if (dbUser) {
            res.redirect(`http://localhost:4001/api/oauth/getCode2?redirectURI=&code=${code}`);
        }
    }
    catch (e) {
        if (e instanceof Error)
            console.log(e.message);
    }
}));
router.post('/token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
}));
router.post('/localAuthorize', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const userhash = email + password;
    const hash = crypto_1.default.createHash('sha256').update(userhash).digest('base64');
    console.log(hash);
    const dbUser = yield verifyId_model_1.default.findOne({
        where: {
            hashId: {
                [sequelize_1.Op.eq]: hash,
            },
        },
    });
    if (dbUser) {
        let token = jsonwebtoken_1.default.sign({
            email: email,
            hashId: hash,
        }, process.env.SECRET_KEY);
        res.cookie('user', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({
            status: true,
            token: token,
        });
    }
    else {
        res.json({
            status: false,
            msg: '일치하는 아이디가 없습니다',
        });
    }
}));
router.post('/getToken', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, gender, mobile, hash } = req.body;
    const EXPIRES_IN = 43199;
    const REFRESH_TOKEN_EXPIRES_IN = 25184000;
    const TOKEN_TYPE = 'bearer';
    const TOKEN = jsonwebtoken_1.default.sign({
        name,
        gender,
        mobile,
        hash,
        exp: EXPIRES_IN,
    }, process.env.SECRET_KEY);
    try {
    }
    catch (e) {
        if (e instanceof Error)
            console.log(e.message);
    }
}));
exports.default = router;
