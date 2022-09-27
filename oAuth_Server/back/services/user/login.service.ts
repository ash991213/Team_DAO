import { boolToNum, makeRawVP, refineVP, responseObject } from '../../routers/app/utils';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import RedirectURI from '../../models/webSite/redirectURI.model';
import deployed from '../../web3';
import TotalPoint from '../../models/user/totalPoint.model';
import { frontend } from '../../routers/user/utils';
import App from '../../models/webSite/app.model';
import DataNeeded from '../../models/webSite/dataNeeded.model';
import VerifyId from '../../models/user/verifyId.model';
import { encrypt, decrypt } from '../utils/hash.service';

let response: any;

const authorize = async (data: any) => {
    const { email, password, restAPI, reURL, giveUserInfo } = data;
    const userhash = email + password;
    const hash = crypto.createHash('sha256').update(userhash).digest('base64');
    try {
        const checkRedirectUri = await RedirectURI.findOne({
            where: {
                restAPI: restAPI,
                redirectURI: reURL,
            },
        });

        if (!checkRedirectUri) throw new Error('존재하지 않는 어플리케이션 혹은 redirect Uri');

        const contract = await deployed;

        const result = await contract.methods.getUser(hash).call();

        if (result[0] == '' || encrypt(email) !== result[5]) {
            response = responseObject(false, 'id/pw를 확인해주세요');
            throw new Error(response.msg);
        }

        const isRegistered = await TotalPoint.findOne({
            where: {
                restAPI,
                email,
            },
        });

        if (!isRegistered) {
            response = {
                status: 'first',
                registerUri: `${frontend}/userAppRegister?email=${email}&restAPI=${restAPI}&redirectUri=${reURL}&hash=${hash}&giveUserInfo=${giveUserInfo}`,
            };
            const headerINfo = { key: 'Access-Control-Allow-Origin', value: frontend };
            return { response, headerINfo };
        }
        if (result) {
            const sentHash = encodeURIComponent(hash);
            response = {
                status: 'redirect',
                redirectInfo: `${reURL}?email=${email}&hash1=${sentHash}`,
            };
            return response;
        }
    } catch (e) {
        response = responseObject(false, e.message);
    }
    return response;
};

const codeAuthorize = async (MAKE_ACCESS_TOKEN: any) => {
    const EXPIRES_IN = 43199;
    try {
        if (MAKE_ACCESS_TOKEN.grant_type !== 'authorization_code') {
            throw new Error('잘못된 데이터 형식입니다.');
        }
        // restAPI에 대응하는 client_secret이 맞는지 확인
        const checkSecretKey = await App.findOne({
            where: {
                restAPI: MAKE_ACCESS_TOKEN.restAPI,
                code: MAKE_ACCESS_TOKEN.client_secret,
            },
        });

        if (!checkSecretKey) {
            throw new Error('잘못된 접근입니다.');
        }

        const ACCESS_TOKEN = jwt.sign(
            {
                MAKE_ACCESS_TOKEN,
                exp: EXPIRES_IN,
            },
            process.env.SECRET_KEY,
        );
        response = {
            status: true,
            ACCESS_TOKEN,
        };
    } catch (e: any) {
        response = responseObject(false, e.message);
    }
    return response;
};

const codeAuthorize2 = async (bearer_token: any) => {
    try {
        const decoded_token = Buffer.from(bearer_token, 'base64').toString('utf-8');

        const decode1 = decoded_token.split('}');
        const decode2 = JSON.parse(decode1[1] + '}}').MAKE_ACCESS_TOKEN;

        if (decode2.grant_type == 'authorization_code') {
            const getUserInfo = await DataNeeded.findOne({
                where: {
                    restAPI: decode2.restAPI,
                },
            });

            const infoArray = [getUserInfo.gender, getUserInfo.name, getUserInfo.age, getUserInfo.addr, getUserInfo.mobile, getUserInfo.email];

            const reqVP = boolToNum(infoArray);

            const contract = await deployed;
            const VP = await contract.methods.getVP(decode2.hash, reqVP).call();

            const rawVP = makeRawVP(VP);

            const refinedVP = refineVP(rawVP);

            response = {
                status: true,
                VP: refinedVP,
                hash: decode2.hash,
            };
        }
    } catch (e) {
        response = responseObject(false, 'access token 검증 실패');
    }
    return response;
};

const localAuthorize = async (email: string, password: string) => {
    const userhash = email + password;
    let cookieInfo;
    try {
        const hash = crypto.createHash('sha256').update(userhash).digest('base64');
        const dbUser = await VerifyId.findOne({
            where: {
                email,
            },
        });

        if (!dbUser) throw new Error('id/pw를 확인해주세요');

        const contract = await deployed;
        const result = await contract.methods.getUser(hash).call();

        if (result[0] == '' || encrypt(email) !== result[5]) {
            response = responseObject(false, 'id/pw를 확인해주세요');
            return response;
        }
        if (result) {
            let token = jwt.sign(
                {
                    email: email,
                    hashId: hash,
                },
                process.env.SECRET_KEY as string,
            );

            cookieInfo = { key: 'user', value: token, options: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } };
            response = {
                status: true,
                token: token,
            };
            return { response, cookieInfo };
        }
    } catch (e) {
        response = responseObject(false, e.message);
    }
    return response;
};

const loginService = {
    authorize,
    codeAuthorize,
    codeAuthorize2,
    localAuthorize,
};
export default loginService;
