const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { response } = require('express');
const { filterNull } = require('./utils');
const { Account, UserInfo } = require('../models');

const router = express.Router();

const baseUrl = 'http://localhost:8000';

const Otp = {
    clientId: 'f07bc5de4c9cd1b8d874a150228308d',
    redirectUri: 'http://localhost:4001/api/oauth/getCode',
    client_secret: '1489507410816383c368e652cc606a6',
};

router.get('/DIDLogin', async (req, res) => {
    const url = `http://localhost:8080/login?clientId=${Otp.clientId}&redirectUri=${Otp.redirectUri}&response_type=code`;
    res.redirect(url);
});

router.get('/getCode', async (req, res) => {
    const { email, hash1 } = req.query;
    const url = 'http://localhost:8000/oauth/login/codeAuthorize';

    const hash = hash1.replace(/ /g, '+');

    const Data = {
        grant_type: 'authorization_code',
        restAPI: Otp.clientId,
        client_secret: Otp.client_secret,
        redirect: Otp.redirectUri,
        email,
        hash,
    };

    let access_token;

    try {
        const response = await axios.post(url, Data);
        access_token = response.data.ACCESS_TOKEN;
    } catch (error) {
        console.log(error);
    }

    // axios 두번 oauth 백으로 1. 코드를던져서 토큰을받기 2. 토큰을던져서 유저정보받기
    try {
        const url = 'http://localhost:8000/oauth/login/codeAuthorize2';
        const Header = {
            headers: {
                Authorization: access_token,
            },
        };

        const response = await axios.get(url, Header);
        const { VP, hash } = response.data;

        const vpCookie = filterNull(VP);

        let stringCookie = '';
        for (let i = 0; i < vpCookie.length; i++) {
            stringCookie += vpCookie[i].att + '=';
            stringCookie += vpCookie[i].value + '&';
        }

        const secret_key = 'test';
        const ACCESS_TOKEN = jwt.sign(
            {
                hash,
                stringCookie,
            },
            secret_key,
        );

        const cookiOpt = { maxAge: 43199 };
        res.cookie('accessToken', ACCESS_TOKEN, cookiOpt);
        res.header('Access_control_allow_origin', 'http://localhost:3001');
        res.header('Content-Type', 'application/json');
        //res.redirect(`http://localhost:8080/ether?accessToken=${ACCESS_TOKEN.split('.')[1]}`);
        //res.redirect(`http://localhost:3001/login?accessToken=${ACCESS_TOKEN.split('.')[1]}`);
        const result = {
            redirectUri: `http://localhost:3001/login?accessToken=${ACCESS_TOKEN.split('.')[1]}`,
        };
        res.json(result);
    } catch (e) {
        console.log(e.message);
    }
});

router.post('/giveUserinfo', async (req, res) => {
    try {
        const { vp, email } = req.body;
        const isRegistered = await Account.findOne({
            where: {
                email,
            },
        });

        if (isRegistered) throw new Error('이미 등록된 사용자입니다.');

        const saveUserInfo = await Account.create({
            email,
        });

        let name = '';
        let mobile = '';

        for (let i = 0; i < vp.length; i++) {
            if (vp[i].att == 'name') {
                name = vp[i].value;
            }
            if (vp[i].att == 'mobile') {
                mobile = vp[i].value;
            }
        }
        console.log(email);

        const insertVP = await UserInfo.create({
            email,
            name,
            mobile,
        });

        const response = {
            status: true,
            msg: '사용자 정보 수신 완료',
        };

        res.json(response);
    } catch (e) {
        console.log(e.message);
        const response = {
            status: false,
            msg: e.message,
        };
        res.json(response);
    }
});

router.get('/getoauthPoint', async (req, res) => {
    const { email } = req.query;
    try {
        const response = await axios.get(`${baseUrl}/oauth/app/getPoint?email=${email}&restAPI=${Otp.clientId}`);
        if (response.data.status == false) throw new Error(response.data.msg);

        res.json({
            status: true,
            point: response.data.point,
        });
    } catch (e) {
        console.log(e.message);
        const response = {
            status: false,
            msg: e.message,
        };
        res.json(response);
    }
});

router.post('/getToken', async (req, res) => {
    console.log('getToken', req.body);
});

module.exports = router;
