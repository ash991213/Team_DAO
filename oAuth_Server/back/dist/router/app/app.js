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
const crypto_1 = __importDefault(require("crypto"));
const app_model_1 = __importDefault(require("../../models/webSite/app.model"));
const dataNeeded_model_1 = __importDefault(require("../../models/webSite/dataNeeded.model"));
const redirectURI_model_1 = __importDefault(require("../../models/webSite/redirectURI.model"));
const router = express_1.default.Router();
router.post('/apiDistribution', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { appName, email } = req.body;
    const randomNum = Math.floor(Math.random() * 1000000);
    const forRestAPI = appName + email + randomNum;
    const randomNum2 = Math.floor(Math.random() * 1000000) + 1000000;
    const forSecret = appName + email + randomNum2;
    const REST_API = crypto_1.default.createHmac('sha256', forRestAPI).digest('hex').substr(0, 31);
    try {
        const exAppName = yield app_model_1.default.findOne({
            where: {
                appName,
            },
        });
        if (exAppName) {
            res.json({
                status: false,
                msg: '이미 사용 중인 어플리케이션 이름입니다.',
            });
        }
        yield app_model_1.default.create({
            owner: email,
            appName,
            restAPI: REST_API,
        });
        yield dataNeeded_model_1.default.create({
            restAPI: REST_API,
            owner: email,
            email: false,
            name: false,
            gender: false,
            age: false,
            addr: false,
            mobile: false,
        });
        res.json({
            status: true,
            msg: '성공적으로 등록되었습니다.',
            REST_API: REST_API,
        });
    }
    catch (e) {
        if (e instanceof Error)
            console.log(e.message);
        res.json({
            status: false,
            msg: '어플리케이션 등록에 실패하였습니다.',
        });
    }
}));
router.post('/getMyApp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const myAppName = yield app_model_1.default.findAll({
            where: {
                owner: email,
            },
        });
        res.json({
            status: true,
            myapp: myAppName,
        });
    }
    catch (e) {
        if (e instanceof Error)
            console.log(e.message);
        res.json({
            status: false,
            msg: '어플리케이션 정보를 불러오는데 실패하였습니다.',
        });
    }
}));
router.use('/appInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { restAPI } = req.body;
    try {
        const urlInfo = yield redirectURI_model_1.default.findAll({
            where: {
                restAPI,
            },
        });
        const appInfo = yield app_model_1.default.findOne({
            where: {
                restAPI,
            },
        });
        const neededInfo = yield dataNeeded_model_1.default.findOne({
            where: {
                restAPI,
            },
        });
        const result = {
            email: appInfo === null || appInfo === void 0 ? void 0 : appInfo.owner,
            appName: appInfo === null || appInfo === void 0 ? void 0 : appInfo.appName,
            redirectURI: urlInfo,
            restAPI,
            neededInfo: [
                { att: 'name', get: neededInfo === null || neededInfo === void 0 ? void 0 : neededInfo.name },
                { att: 'email', get: neededInfo === null || neededInfo === void 0 ? void 0 : neededInfo.email },
                { att: 'gender', get: neededInfo === null || neededInfo === void 0 ? void 0 : neededInfo.gender },
                { att: 'age', get: neededInfo === null || neededInfo === void 0 ? void 0 : neededInfo.age },
                { att: 'address', get: neededInfo === null || neededInfo === void 0 ? void 0 : neededInfo.addr },
                { att: 'mobile', get: neededInfo === null || neededInfo === void 0 ? void 0 : neededInfo.mobile },
            ],
        };
        res.json({
            status: true,
            result,
        });
    }
    catch (e) {
        if (e instanceof Error)
            console.log(e.message);
        res.json({
            status: false,
            msg: '비정상적 접근이 감지되었습니다.',
        });
    }
}));
router.use('/getInfoUpdate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { getUserInfo, restAPI } = req.body;
    const newGetInfo = [];
    for (let i = 0; i < getUserInfo.length; i++) {
        if (getUserInfo[i].get == true) {
            newGetInfo.push(1);
        }
        else {
            newGetInfo.push(0);
        }
    }
    try {
        yield dataNeeded_model_1.default.update({
            name: newGetInfo[0],
            email: newGetInfo[1],
            gender: newGetInfo[2],
            age: newGetInfo[3],
            addr: newGetInfo[4],
            mobile: newGetInfo[5],
        }, {
            where: {
                restAPI,
            },
        });
        res.json({
            status: true,
            msg: '성공적으로 반영되었습니다.',
        });
    }
    catch (e) {
        if (e instanceof Error)
            console.log(e.message);
        res.json({
            status: false,
            msg: '서버 에러',
        });
    }
}));
router.use('/updateRedirect', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uri, restAPI } = req.body;
    for (let i = 0; i < uri.length; i++) {
        if (uri[i] !== null) {
            uri[i] = uri[i].trim();
            console.log(uri[i]);
        }
    }
    try {
        yield redirectURI_model_1.default.update({
            redirectURI1: uri[0],
            redirectURI2: uri[1],
            redirectURI3: uri[2],
            redirectURI4: uri[3],
            redirectURI5: uri[4],
        }, {
            where: {
                restAPI,
            },
        });
        res.json({
            status: true,
            msg: '리다이렉트 uri 수정이 완료되었습니다.',
        });
    }
    catch (e) {
        if (e instanceof Error)
            console.log(e.message);
        res.json({
            status: false,
            msg: '알수 없는 에러가 발생하였습니다. 나중에 다시 시도해주세요',
        });
    }
}));
exports.default = router;
