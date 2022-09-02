import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import axios from 'axios';
import crypto from 'crypto';
import deployed from '../../web3';
import VerifyId from '../../models/user/verifyId.model';
import DataNeeded from '../../models/webSite/dataNeeded.model';
import sequelize from '../../models/index';

console.log(sequelize);

const router = express.Router();

router.post('/authorize', async (req: Request, res: Response) => {
    console.log('오오오오오오오오??');
    const { email, password, restAPI, redirectURI } = req.body;
    const userhash = email + password;
    const hash = crypto.createHash('sha256').update(userhash).digest('base64');
    const deploy = await deployed();
    const result = await deploy.methods.getUser(hash).call();

    const gender = result[0];
    const name = result[1];
    const age = result[2];
    const address = result[3];
    const mobile = result[4];
    const userEmail = result[5];

    const dbUser = await VerifyId.findOne({
        where: {
            hashId: {
                [Op.eq]: hash,
            },
        },
    });
    try {
        if (dbUser) {
            const getSiteInfo = await DataNeeded.findOne({
                where: {
                    restAPI: {
                        [Op.eq]: restAPI,
                    },
                },
            });

            if (getSiteInfo?.restAPI === restAPI) {
                const response = {
                    status: true,
                    name: name,
                    mobile: mobile,
                    restAPI,
                };
                await axios.post('http://localhost:4000/api/oauth/getCode', response);
            } else if (getSiteInfo?.restAPI === restAPI) {
                const response = {
                    status: true,
                    hash: hash,
                    restAPI: restAPI,
                    redirectURI: redirectURI,
                    name: name,
                    gender: gender,
                    mobile: mobile,
                };

                await axios.post('http://localhost:4001/api/oauth/getCode', response);
                res.redirect(`http://localhost:4001/api/Oauth/getCode2?redirectUri=${redirectUri}&code=${code}`);
            } else if (getSiteInfo?.restAPI === restAPI) {
                const response = {
                    status: true,
                    restAPI: restAPI,
                    mobile: mobile,
                    userEmail: userEmail,
                };
                await axios.post('http://localhost:4002/api/oauth/getCode', response);
            } else if (getSiteInfo?.restAPI === restAPI) {
                const response = {
                    status: true,
                    name: name,
                    age: age,
                    address: address,
                    restAPI: restAPI,
                };
                await axios.post('http://localhost:4003/api/oauth/getCode', response);
            }
        }
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
    }
});

router.post('/code', async (req: Request, res: Response) => {});

router.post('/localAuthorize', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const userhash = email + password;
    const hash = crypto.createHash('sha256').update(userhash).digest('base64');
    console.log(hash);

    const dbUser = await VerifyId.findOne({
        where: {
            hashId: {
                [Op.eq]: hash,
            },
        },
    });

    if (dbUser) {
        let token = jwt.sign(
            {
                email: email,
                hashId: hash,
            },
            process.env.SECRET_KEY as string,
        );
        res.cookie('user', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({
            status: true,
            token: token,
        });
    } else {
        res.json({
            status: false,
            msg: '일치하는 아이디가 없습니다',
        });
    }
});

router.post('/getToken', async (req: Request, res: Response) => {
    const { name, gender, mobile, hash } = req.body;

    const EXPIRES_IN = 43199;
    const REFRESH_TOKEN_EXPIRES_IN = 25184000;
    const TOKEN_TYPE = 'bearer';

    const TOKEN = jwt.sign(
        {
            name,
            gender,
            mobile,
            hash,
            exp: EXPIRES_IN,
        },
        process.env.SECRET_KEY as string,
    );

    ////

    // const gender = result[0]
    // const name = result[1]
    // const age = result[2]
    // const address = result[3]
    // const mobile = result[4]
    // const userEmail = result[5]

    // 만약 코드가 있고 그안에서 restAPI가 = b에서 맞으면 b에대한 정보 가져와줌

    // const MAKE_ACCESS_TOKEN = req.body;
    // const EXPIRES_IN = 43199;
    // const REFRESH_TOKEN_EXPIRES_IN = 25184000;

    // const TOKEN = jwt.sign(
    //     {
    //         MAKE_ACCESS_TOKEN,
    //         exp: EXPIRES_IN,
    //     },
    //     process.env.SECRET_KEY,
    // );

    // const TOKEN2 = jwt.sign(
    //     {
    //         MAKE_ACCESS_TOKEN,
    //         exp: REFRESH_TOKEN_EXPIRES_IN,
    //     },
    //     process.env.SECRET_KEY,
    // );

    // const TOKEN_TYPE = 'bearer';
    // const REFRESH_TOKEN = TOKEN2.split('.')[1];
    // const ACCESS_TOKEN = TOKEN.split('.')[1];

    // const DATA = {
    //     TOKEN_TYPE: TOKEN_TYPE,
    //     ACCESS_TOKEN: ACCESS_TOKEN,
    //     EXPIRES_IN: EXPIRES_IN,
    //     REFRESH_TOKEN: REFRESH_TOKEN,
    //     REFRESH_TOKEN_EXPIRES_IN: REFRESH_TOKEN_EXPIRES_IN,
    //     scope: 'account_email profile',
    // };

    try {
        // await axios.post('http://localhost:3500/oAuthGetToken', DATA);
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
    }
});

/**
     *
     * "token_type":"bearer",
      "access_token":"${ACCESS_TOKEN}",
      "expires_in":43199,
      "refresh_token":"${REFRESH_TOKEN}",
      "refresh_token_expires_in":25184000,
      "scope":"account_email profile"
     * 1. 유저의 토큰 ?
     * 2. 토큰 유지시간?
     * 3. 재발급받은 토큰 ?
     * 4. 재발급 받은 토큰의 유지시간?
     * 5. 고정값 ?
     *
     * 찾아본 정보 :
     * access_token은 발급 받은 후 12시간-24시간(정책에 따라 변동 가능)동안 유효합니다.
     * refresh token은 두달간 유효하며, refresh token 만료가 1달 이내로 남은 시점에서
     * 사용자 토큰 갱신 요청을 하면 갱신된 access token과 갱신된 refresh token이 함께 반환됩니다.
    */

// 토큰을받으면 토큰해석해서 토큰 유저정보던져줌
export default router;
