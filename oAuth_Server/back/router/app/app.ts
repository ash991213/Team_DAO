import express, { Request, response, Response } from 'express';
import crypto from 'crypto';
import App from '../../models/webSite/app.model';
import DataNeeded from '../../models/webSite/dataNeeded.model';
import RedirectURI from '../../models/webSite/redirectURI.model';
import {makeRedirectUriList, generateHash, responseObject, infoStringToBool, noWhiteSpace, filterNull, insertNewUri, filterNotNeeded, getUserinfo, rawVP, refineVP} from './utils';
import TotalPoint from '../../models/user/totalPoint.model';
import deployed from '../../web3';
import axios from 'axios';

const router = express.Router();
const MAX_REDIRECT_URI_NUM = 5

router.post('/apiDistribution', async (req: Request, res: Response) => {
    const { appName, email } = req.body;

    const AppCodes = generateHash(appName, email);
    const restAPI = AppCodes[0];
    const client_secret = AppCodes[1]

    try {
        const exAppName = await App.findOne({
            where: {
                appName: appName,
                owner: email
            },
        });

        if (exAppName) {
            throw new Error('이미 등록된 이메일입니다.')
        }

        await App.create({
            owner: email,
            appName,
            restAPI: restAPI,
            code : client_secret
        });

        await DataNeeded.create({
            restAPI: restAPI,
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
            REST_API: restAPI,
        });
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
        res.json(responseObject(false,  e.message));
    }
});

router.post('/getMyApp', async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const myAppName = await App.findAll({
            where: {
                owner: email,
            },
        });
        res.json({
            status: true,
            myapp: myAppName,
        });
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
        res.json(responseObject(false, '비정상적 접근입니다.'));
    }
});

router.use('/appInfo', async (req: Request, res: Response) => {
    const { restAPI } = req.body;

    try {
        const urlInfo = await RedirectURI.findAll({
            where: {
                restAPI,
            },
        });
        const appInfo = await App.findOne({
            where: {
                restAPI,
            },
        });
        const neededInfo = await DataNeeded.findOne({
            where: {
                restAPI,
            },
        });

        const tempUri = makeRedirectUriList(MAX_REDIRECT_URI_NUM)

        for(let i = 0; i<urlInfo.length; i++) {
            tempUri[i] = urlInfo[i].redirectURI
        }

        const result = {
            email: appInfo?.owner,
            appName: appInfo?.appName,
            client_secret : appInfo?.code,
            redirectURI: tempUri,
            restAPI,
            neededInfo: [
                { att: 'name', get: neededInfo?.name },
                { att: 'email', get: neededInfo?.email },
                { att: 'gender', get: neededInfo?.gender },
                { att: 'age', get: neededInfo?.age },
                { att: 'address', get: neededInfo?.addr },
                { att: 'mobile', get: neededInfo?.mobile },
            ],
        };
        res.json({
            status: true,
            result,
        });
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
        res.json(responseObject(false, '비정상적 접근이 감지되었습니다.'));
    }
});

router.use('/getInfoUpdate', async (req: Request, res: Response) => {
    const { getUserInfo, restAPI } = req.body;
    const newGetInfo = infoStringToBool(getUserInfo);

    try {
        await DataNeeded.update(
            {
                name: newGetInfo[0],
                email: newGetInfo[1],
                gender: newGetInfo[2],
                age: newGetInfo[3],
                addr: newGetInfo[4],
                mobile: newGetInfo[5],
            },
            {
                where: {
                    restAPI,
                },
            },
        );

        res.json(responseObject(true, '정상적으로 반영되었습니다'));
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
        res.json(responseObject(false, '서버 에러, 나중에 다시 시도해주세요.'));
    }
});

router.post('/updateRedirect', async (req: Request, res: Response) => {
    const { uris, restAPI } = req.body;

    const uri = noWhiteSpace(uris)

    try {
        const oldRedirectURI = await RedirectURI.destroy({
            where : {
                restAPI
            }
        })

        const newRedirectUri = filterNull(uri)

        insertNewUri(restAPI, newRedirectUri)

        res.json(responseObject(true, '리다이렉트 url 수정이 완료되었습니다.'));
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
        res.json(responseObject(false, '서버 에러'));
    }
});

router.get('/giveUserInfo', async (req:Request, res : Response) => {
    const { restAPI } = req.query
    
    try {

        const appName = await App.findOne({
            where : {
                restAPI
            }
        })

        const infoReq = await DataNeeded.findOne({
            where : {
                restAPI
            }
        })
        // 이 둘은 join으로 묶을 수 있을 것 같다.

        if(!infoReq) {
            throw new Error('비정상적인 접근입니다.')
        }

        let infos = rawVP(infoReq)

        const filteredInfos = filterNotNeeded(infos)

        const response = {
            status: true,
            appName: appName.appName,
            infos: filteredInfos
        }

        res.json(response)
    }
    catch (e) {
        console.log(e.message)
        res.json(responseObject(false, '비정상적인 접근입니다.'))
    }
})

router.post('/userdidregister', async (req, res) => {
    const { restAPI, email, point, hash } = req.body

    try{
        const ifUser = await TotalPoint.findOne({
            where : {
                email,
                restAPI 
            }
        })

        if(ifUser) throw new Error('이미 가입된 사용자입니다.')

        const syncUser = await TotalPoint.create({
            restAPI,
            email,
            point,
        })

        const rawVp = await getUserinfo(restAPI, hash)
        console.log('-------')
        console.log(rawVp)
        console.log('-------')

        const refinedVP = refineVP(rawVp)
  
        const data = {
            vp:refinedVP,
            email
        }

        const response = await axios.post('http://localhost:4001/api/oauth/giveUserInfo', data )
        
        if (response.data.status == false) {
            throw new Error('클라이언트 서버 에러')
        }

        res.json(responseObject(true, '정상적으로 등록되었습니다. 다시 로그인해주세요.'))
        // 문제가 없다면 로그인, 쿠키 생성을 위해 클라이언트 서버의 백엔드로 리다이렉트
    }
    catch(e) {
        console.log(e.message)
        res.json(responseObject(false, e.message))
    }
})

router.get('/getPoint', async (req, res) => {
    const { restAPI, email} = req.query
    try {
        const userPoint = await TotalPoint.findOne({
            where : {
                restAPI,
                email
            }
        })
    
        const point = userPoint.point
        const response = {
            status: true,
            point,
        }
        res.json(response)
    }

    catch(e) {
        console.log(e.message)
        res.json(responseObject(false, '포인트를 가져오지 못했습니디.'))
    }
})


export default router;
