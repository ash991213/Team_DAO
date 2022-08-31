const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const axios = require('axios');
const Web3 = require('web3');
const nodeMailer = require('nodemailer');
const router = express.Router();
const DID = require('../contracts/DID.json');
const { deployed } = require('../web3.js');
const { user, sequelize } = require('../models');
const { Op } = require('sequelize');
const { AccessSite } = require('../models');
const { addAbortSignal } = require('stream');

const web3 = new Web3(new Web3.providers.HttpProvider('https://opt-goerli.g.alchemy.com/v2/GgIVsMFIKf4Pjwp8TmTN8gXftrnZf9A2'));

const generateRandom = (min, max) => {
    const ranNum = (Math.floor(Math.random() * (max - min + 1)) + min).toString();

    const array = [];
    for (let i = 0; i < 6; i++) {
        array.push(ranNum[i]);
    }

    return array;
};

router.post('/email', async (req, res) => {
    const { email } = req.body;

    const number = generateRandom(111111, 999999);
    const mailPoster = nodeMailer.createTransport({
        service: 'Naver',
        host: 'smtp.naver.com',
        port: 587,
        auth: {
            user: process.env.EMAIL_SENDER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    let mailOptions = {
        from: 'gusdn6671@naver.com',
        to: email,
        subject: '인증번호 입력해주세요 ',
        html: `<div 
        style='
        text-align: center; 
        width: 60%; 
        height: 50%;
        margin: 15%;
        padding: 20px;
        border:2px solid #FFB6C1;
        border-radius: 10px;
        background-color:#FFFAFA;
        '>

        
        <h2 style='
        color:pink;
        font-weight:bold;
        '>아래 6자리 숫자를 화면에 입력해주세요.</h2> <br/>  
        <div style='display: flex;
            justify-content: space-between ;
           '>
           <div style='  width:5rem;
           height:5rem;
           border:2px solid #FFB6C1;
           border-radius: 10px;
           background-color:#FFFAFA;'>
           <h1 style='  
           text-align:center;
           font-weight:bold;
           font-size:47px;
           color:#FFB6C1;'>
           ${number[0]}
           </h1>
           
        </div>
        <div style='  width:5rem;
           height:5rem;
           border:2px solid #FFB6C1;
           border-radius: 10px;
           background-color:#FFFAFA;'>
           <h1 style='  
           text-align:center;
           font-weight:bold;
           font-size:47px;
           color:#FFB6C1;'>
           ${number[1]}
           </h1>
           
        </div>
        <div style='  width:5rem;
           height:5rem;
           border:2px solid #FFB6C1;
           border-radius: 10px;
           background-color:#FFFAFA;'>
           <h1 style='  
           text-align:center;
           font-weight:bold;
           font-size:47px;
           color:#FFB6C1;'>
           ${number[2]}
           </h1>
           
        </div>

        <div style='  width:5rem;
           height:5rem;
           border:2px solid #FFB6C1;
           border-radius: 10px;
           background-color:#FFFAFA;'>
           <h1 style='  
           text-align:center;
           font-weight:bold;
           font-size:47px;
           color:#FFB6C1;'>
           ${number[3]}
           </h1>
           
        </div>

        <div style='  width:5rem;
           height:5rem;
           border:2px solid #FFB6C1;
           border-radius: 10px;
           background-color:#FFFAFA;'>
           <h1 style='  
           text-align:center;
           font-weight:bold;
           font-size:47px;
           color:#FFB6C1;'>
           ${number[4]}
           </h1>
           
        </div>

        <div style='  width:5rem;
           height:5rem;
           border:2px solid #FFB6C1;
           border-radius: 10px;
           background-color:#FFFAFA;'>
           <h1 style='  
           text-align:center;
           font-weight:bold;
           font-size:47px;
           color:#FFB6C1;'>
           ${number[5]}
           </h1>
           
        </div>

   </div>


</div> `,
    };

    mailPoster.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            res.status(201);
            res.json({
                status: true,
                number: number,
            });
        }
    });
});

router.post('/apiDistribution', async (req, res) => {
    const { appName, email } = req.body;

    //  프론트에서 보낸 쿠키를 쪼개서 맞는 email인지 확인 (db와 대조)
    const randomNum = Math.floor(Math.random() * 1000000);
    const forRestAPI = appName + email + randomNum;
    const randomNum2 = Math.floor(Math.random() * 1000000) + 1000000;
    const forSecret = appName + email + randomNum2;
    const REST_API = crypto.createHmac('sha256', forRestAPI).digest('hex').substr(0, 31);
    const client_secret = crypto.createHmac('sha256', forSecret).digest('hex').substr(0, 31);

    try {
        const exAppName = await AccessSite.findOne({
            where: {
                appName: appName,
            },
        });

        if (exAppName) {
            const response = {
                status: false,
                msg: '이미 사용 중인 어플리케이션 이름입니다.',
            };
            res.json(response);
            return;
        }
        await AccessSite.create({
            email: email,
            appName: appName,
            restAPI: REST_API,
            clientSecretKey: client_secret,
        });
        const response = {
            status: true,
            msg: '성공적으로 등록되었습니다.',
            REST_API: REST_API,
            client_secret: client_secret,
        };
        res.json(response);
    } catch (e) {
        console.log(e.message);
    }
});

router.use('/getMyApp', async (req, res) => {
    const { email } = req.body;
    try {
        const myAppName = await AccessSite.findAll({
            where: {
                email: email,
            },
        });

        const response = {
            myapp: myAppName,
        };
        res.json(response);
    } catch (e) {
        console.log(e.message);
    }
});

router.use(
    '/appInfo',
    async (req, res) => {
        const { appName } = req.body;
        try {
            const thatApp = await AccessSite.findOne({
                where: {
                    appName: appName,
                },
            });


        const appInfo = thatApp.dataValues;
        const redirectURI = [thatApp.dataValues.redirectURI1, thatApp.dataValues.redirectURI2, thatApp.dataValues.redirectURI3, thatApp.dataValues.redirectURI4, thatApp.dataValues.redirectURI5];

        const appInfor = {
            id: appInfo.idx,
            email: appInfo.email,
            appName: appInfo.appName,
            redirectURI: redirectURI,
            restAPI: appInfo.restAPI,
            clientSecretKey: appInfo.clientSecretKey,
        };

        const response = {
            status: true,

            appInfo: appInfor,
        };

        res.json(response);
    }
        catch(e) {
            console.log(e.message)

            res.json({
                status: false,
                msg: '비정상적 접근이 감지되었습니다.',
            });
        }
    });

router.use('/updateRedirect', async (req,res) => {
    const { uri, email, appName } = req.body
    
    for(let i = 0; i < uri.length; i++) {
        if( uri[i] !== null ) {
            uri[i] = uri[i].trim()
            console.log(uri[i])
        }
    }

    try {
        const update = await AccessSite.update({
            
            redirectURI1 : uri[0], 
            redirectURI2 : uri[1], 
            redirectURI3 : uri[2], 
            redirectURI4 : uri[3], 
            redirectURI5 : uri[4], },{
            where : {
                email,
                appName
            }
        })

        const response = {
            status : true,
            msg: '리다이렉트 uri 수정이 완료되었습니다.'
        }
        res.json(response)
    }
    catch(e) {
        console.log(e.message)
        res.json({
            status: false,
            msg: '알수 없는 에러가 발생하였습니다. 나중에 다시 시도해주세요'
        })
    }
});


router.post('/oAuthRegister', async (req, res) => {
    const { email, password, gender, name, age, addr, mobile } = req.body;
    // 이메일,패스워드,성별,이름,나이,주소,핸드폰번호
    try {
        const userHash = email + password;
        const hash = crypto.createHash('sha256').update(userHash).digest('base64');
        const passwordHash = await bcrypt.hash(password, 12);

        const DATA = {
            email: email,
            password: passwordHash,
            gender: gender,
            name: name,
            age: age,
            addr: addr,
            mobile: mobile,
        };

        const deploy = await deployed();
        console.log('qweq')
        await deploy.methods.registerUser(hash, DATA).send({
            from: '0x7b6283591c09b1a738a46Acc0BBFbb5943EDb4F4',
        });

        const result = await deploy.methods.getUser(hash).call();

        if (result) {
            await user.create({
                hashId: hash,
            });
            const response = {
                status: true,
                msg: '회원 가입이 완료되었습니다.',
            };
            res.json(response);
        } else {
            const response = {
                status: false,
                msg: '회원 가입에 실패했습니다.',
            };
            res.json(response);
        }
    } catch (error) {
        console.log(error);
    }
});

router.post('/upDatePassword', async (req, res) => {
    const { email, newPassword, oldPassword } = req.body;

    try {
        console.log(req.body);
        const previousHash = email + oldPassword;
        const newpasswordId = email + newPassword;
        const oldHash = crypto.createHash('sha256').update(previousHash).digest('base64');
        const newHash = crypto.createHash('sha256').update(newpasswordId).digest('base64');
        const deploy = await deployed();
        await deploy.methods.updatePassword(oldHash, newHash).send({
            from: '0x7b6283591c09b1a738a46Acc0BBFbb5943EDb4F4',
        });

        const result = await deploy.methods.getUser(oldHash).call();
        const result2 = await deploy.methods.getUser(newHash).call();

        console.log(result);
        console.log(result2);
    } catch (e) {
        console.log(e.message);
    }
});

router.post('/upDateUser', async (req, res) => {
    const { gender, name, age, addr, mobile, email, password } = req.body;

    try {
        const userHash = email + password;
        const hash = crypto.createHash('sha256').update(userHash).digest('base64');

        const DATA = {
            gender: gender,
            name: name,
            age: age,
            addr: addr,
            mobile: mobile,
            email: email,
        };

        const deploy = await deployed();
        await deploy.methods.updateUser(hash, DATA).send({
            from: '0x7b6283591c09b1a738a46Acc0BBFbb5943EDb4F4',
            gas: 10000000,
        });

        const result = await deploy.methods.getUser(hash).call();
        console.log(result);
    } catch (e) {
        console.log(e.message);
    }
});

router.post('/searchUser', async (req, res) => {
    const { email, password } = req.body;
    const userHash = email + password;
    const hash = crypto.createHash('sha256').update(userHash).digest('base64');
    const deploy = await deployed();
    const result = await deploy.methods.getUser(hash).call();
    console.log(result);
});

router.post('/deleteUser', async (req, res) => {
    const { email, password } = req.body;
    // 에러수정 
    
    try {
        const userHash = email + password;
        const hash = crypto.createHash('sha256').update(userHash).digest('base64');
        const deploy = await deployed();
        await deploy.methods.deleteUser('asdf').send({
            from: '0x7b6283591c09b1a738a46Acc0BBFbb5943EDb4F4',
            gas: 10000000,
        });
        const result = await deploy.methods.getUser(hash).call();
        console.log(result);
    } catch (error) {
        console.log(error);
    }
});

router.post('/authorize', async (req, res) => {
    const {email,password,code,restAPI} = req.body
    // * 블록체인 네트워크 아이디 패스워드
    const userhash = email + password;
    const hash = crypto.createHash('sha256').update(userhash).digest('base64');
    const deploy = await deployed();
    const result = await deploy.methods.getUser(hash).call();

    const gender = result[0]
    const name = result[1]
    const age = result[2]
    const address = result[3]
    const mobile = result[4]
    const userEmail = result[5]
    

    console.log(result)
    // * 인가코드
    const asite = 'dkstnghks';
    const bsite = 'dltmdwns';
    const csite = 'dlagusdn';
    const dsite = 'rlawlgus';

    const code0 = crypto.createHash('sha256').update(asite).digest('base64'); // * a사이트 인가코드
    console.log(code0)
    const code1 = crypto.createHash('sha256').update(bsite).digest('base64'); // * b사이트 인가코드
    console.log(code1)
    const code2 = crypto.createHash('sha256').update(csite).digest('base64'); // * c사이트 인가코드
    console.log(code2)
    const code3 = crypto.createHash('sha256').update(dsite).digest('base64'); // * d사이트 인가코드
    console.log(code3)


    const dbUser = await user.findOne({
        where: {
            hashId: {
                [Op.eq]: hash,
            },
        },
    });

    console.log('db유저체크??')
    try {
        // * 블록체인 네트워크에 아이디 패스워드 가져와서 확인
        if (dbUser) {

            console.log('여기 잘들어옴??')
              const getSiteInfo = await AccessSite.findAll({
                where: {
                    email: {
                        [Op.eq]: email,
                    },
                },
            });

            // restAPI 일치 / code 일치
            const getRestAPI = []
            for(let i = 0; i<getSiteInfo.length; i++){
                getRestAPI.push(getSiteInfo[i].dataValues.restAPI)
            }

            console.log(code)
            console.log(code0)
            console.log(getRestAPI[0])
            console.log(restAPI)

            console.log('여기는??')

           if(code0 === code && getRestAPI[0]=== restAPI){

            console.log('여기는오?')
            const response = {
                status:true,
                code:code,
                name:name,
                mobile:mobile
            }

            await axios.post('http://localhost:4000/api/oauth/getCode',response)
           }else if (code1===code && getRestAPI[1]=== restAPI){

            console.log('여긴옴????')
            const response = {
                status:true,
                code:code,
                restAPI:restAPI,
                // name:name,
                // gender:gender,
                // mobile:mobile
            }
            
            await axios.post('http://localhost:4001/api/oauth/getCode',response)
           }else if(code2===code && getRestAPI[2]=== restAPI){
            const response = {
                status:true,
                code:code,
                restAPI:restAPI,
                // mobile:mobile,
                // userEmail:userEmail
            }
            await axios.post('http://localhost:4002/api/oauth/getCode',response)
           }else if(code3===code && getRestAPI[3]=== restAPI){
            const response = {
                status:true,
                code:code,
                name:name,
                age:age,
                address:address
            }
            await axios.post('http://localhost:4003/api/oauth/getCode',response)
           }else{
            const response = {
                status:false,
                msg:'코드 또는 restAPI가 일치하지않습니다'
            }
            await axios.post('http://localhost:4003/api/oauth/getCode',response)
     }

    
          
    }        
    } catch (error) {
        console.log(error.message);
    }
});

router.post('/getToken', async (req, res) => {
    console.log(req.body)

    const EXPIRES_IN = 43199;
    const REFRESH_TOKEN_EXPIRES_IN = 25184000;

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
    } catch (error) {
        console.log(error);
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

module.exports = router;
