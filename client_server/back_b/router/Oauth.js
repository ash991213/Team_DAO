const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = express.Router();

const baseUrl = 'http://localhost:8000/api/Oauth';

const Otp = {
    clientId: '460716d6dfc9d3e95765694659384cd',
    redirectUri: 'http://localhost:4001',
};

router.get('/DIDLogin', async (req, res) => {
    const url = `http://localhost:8080/login?clientId=${Otp.clientId}&redirectUri=${Otp.redirectUri}&response_type=code`;
    res.redirect(url);
});

router.get('/getCode', async (req, res) => {
    console.log('여기까지오니??');
    console.log(req.query.code); // 인가코드 받기
    const { code } = req.query;

    if (code) {
    }
    // axios 요청 보내서 토큰 받기 (with 인가코드)
    // res.cookie('asfd', '')
    // res.json({sibal: 'sibal'})

    // axios 두번 oauth 백으로 1. 코드를던져서 토큰을받기 2. 토큰을던져서 유저정보받기
});

// router.post('/getCode', async (req, res) => {
//     console.log('여기까지오니??');
//     const { restAPI, redirectURI, name, gender, mobile, hash } = req.body;

//     try {
//         if (restAPI) {
//             const Data = {
//                 restAPI: restAPI,
//                 redirectURI: redirectURI,
//                 name: name,
//                 gender: gender,
//                 mobile: mobile,
//                 hash: hash,
//                 code: code0,
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             };
//             await axios.post('http://localhost:8000/api/oauth/getToken', Data);
//         } else {
//             return res.status(403).send('RestAPI가 없습니다 ');
//         }
//     } catch (error) {
//         console.log(error);
//     }
// });

router.post('/oAuthGetToken', async (req, res) => {
    const response = req.body;

    console.log(response);

    // const ID_TOKEN = jwt.sign(
    //     {
    //         user,
    //     },
    //     process.env.SECRET_KEY,
    // );
    // ID_TOKEN.split('.')[1]

    // response.id_token =ID_TOKEN.split('.')[1]

    // const TokenUserId = JSON.parse(Buffer.from(splitToken, 'base64').toString('utf-8')).user.userId
    // const TokenUserPw = JSON.parse(Buffer.from(splitToken, 'base64').toString('utf-8')).user.userPw
    // console.log(TokenUserId,TokenUserPw)

    /**
     * oauth서버에서 DATA값받아옴
     * 그 DATA 값에 id_token을 추가해서 front 에 token저장해줘야함 ;
     * 프론트에서 그리고 그 토큰값을 풀어서 userId 랑 userpw 를 대조해서 맞으면 로그인을 성공시켜줘야함
     * 의문점 ? : ACCESS_TOKEN에도 USER값이들어가있는데 굳이 왜 ID_TOKEN을 만들어주는지 모르겠음 ...
     * 의문점 풀이 : access_token은 사실상 back oauth검증 / id _token은 백이랑 프론트 검증용? 이라고생각해보고있음..
     * */
});

module.exports = router;
