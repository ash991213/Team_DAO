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
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const web3_1 = __importDefault(require("../../web3"));
const verifyId_model_1 = __importDefault(require("../../models/user/verifyId.model"));
const dataNeeded_model_1 = __importDefault(require("../../models/webSite/dataNeeded.model"));
const index_1 = __importDefault(require("../../models/index"));
console.log(index_1.default);
const router = express_1.default.Router();
router.post('/authorize', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('오오오오오오오오??');
    const { email, password, restAPI, redirectURI } = req.body;
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
    try {
        if (dbUser) {
            const getSiteInfo = yield dataNeeded_model_1.default.findOne({
                where: {
                    restAPI: {
                        [sequelize_1.Op.eq]: restAPI,
                    },
                },
            });
            if ((getSiteInfo === null || getSiteInfo === void 0 ? void 0 : getSiteInfo.restAPI) === restAPI) {
                const response = {
                    status: true,
                    name: name,
                    mobile: mobile,
                    restAPI,
                };
                yield axios_1.default.post('http://localhost:4000/api/oauth/getCode', response);
            }
            else if ((getSiteInfo === null || getSiteInfo === void 0 ? void 0 : getSiteInfo.restAPI) === restAPI) {
                const response = {
                    status: true,
                    hash: hash,
                    restAPI: restAPI,
                    redirectURI: redirectURI,
                    name: name,
                    gender: gender,
                    mobile: mobile,
                };
                yield axios_1.default.post('http://localhost:4001/api/oauth/getCode', response);
                res.redirect(`http://localhost:4001/api/Oauth/getCode2?redirectUri=${redirectUri}&code=${code}`);
            }
            else if ((getSiteInfo === null || getSiteInfo === void 0 ? void 0 : getSiteInfo.restAPI) === restAPI) {
                const response = {
                    status: true,
                    restAPI: restAPI,
                    mobile: mobile,
                    userEmail: userEmail,
                };
                yield axios_1.default.post('http://localhost:4002/api/oauth/getCode', response);
            }
            else if ((getSiteInfo === null || getSiteInfo === void 0 ? void 0 : getSiteInfo.restAPI) === restAPI) {
                const response = {
                    status: true,
                    name: name,
                    age: age,
                    address: address,
                    restAPI: restAPI,
                };
                yield axios_1.default.post('http://localhost:4003/api/oauth/getCode', response);
            }
        }
    }
    catch (e) {
        if (e instanceof Error)
            console.log(e.message);
    }
}));
router.post('/code', (req, res) => __awaiter(void 0, void 0, void 0, function* () { }));
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
