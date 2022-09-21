import express, { Request, Response } from 'express';
import { IResponse_App } from '../../@types/response';
import appService from '../../services/app/app.service';

const router = express.Router();
const MAX_REDIRECT_URI_NUM = 5;
let response: IResponse_App;


router.post('/apiDistribution', async (req: Request, res: Response) => {
    const { appName, email } = req.body;
    try {
        response = await appService.apiDistribution(appName, email);
        if (response.status !== true) throw new Error(response.msg);
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
    }
    res.json(response);
});

/**
 * @openapi
 * /Oauth/app/getMyApp: 
 *   post:
 *     tag:
 *     - call, application
 *     summary: transfer data of applications
 *     description: Optional 디스크립션
 *     parameters:
 *       - in: body
 *         name: email
 *         required: true
 *         description: application owner's email
 *         schema:
 *           type: string
 *           example: "test@gmail.com"
 *     responses:
 *       '200':    
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/Response'
 *       '404':
 *         description: uri not found.
 * components:
 *   Response:
 *     type: array
 *     properties:
 *       status:
 *         type: boolean
 *       myapp:
 *         type: array
 *     required:
 *     - status
 */

router.post('/getMyApp', async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        response = await appService.getMyApp(email);
        console.log(response)
        if (response.status !== true) throw new Error(response.msg);
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
    }
    res.json(response);
});

/**
 * @openapi
 *  /Oauth/app/deleteMyApp:
 *   post:
 *     tag:
 *     - delete, application
 *     summary: delete selected application
 *     description: stop syncing user's application
 *     parameters:
 *       - in: body
 *         name: restAPI
 *         required: true
 *         description: application's restAPI
 *         schema:
 *           type: string
 *           example: "ed2bddf3ece5bf7bf4fd134c1fad973"
 *         - in: body
 *         name: client_secret
 *         required: true
 *         description: client_secret code
 *         schema:
 *           type: string
 *           example: "ed2bddf3ece5bf7bf4fd134c1fad973"
 *     responses:
 *       '200':    
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/Response'
 *       '404':
 *         description: uri not found.
 * components:
 *   Response:
 *     type: 
 *     properties:
 *       status:
 *         type: boolean
 *       msg:
 *         type: string
 *     required:
 *     - status
 * -msg
 */

router.post('/deleteApp', async (req: Request, res: Response) => {
    const { restAPI, client_secret } = req.body;
    try {
        response = await appService.deleteApp(restAPI, client_secret);
        if (response.status !== true) throw new Error(response.msg);
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
    }
    res.json(response);
});

/**
 * @openapi
 *  /Oauth/app/appInfo:
 *   post:
 *     tag:
 *     - call, application
 *     summary: load selected application's information
 *     description: same as summary
 *     parameters:
 *       - in: body
 *         name: restAPI
 *         required: true
 *         description: application's restAPI
 *         schema:
 *           type: string
 *           example: "ed2bddf3ece5bf7bf4fd134c1fad973"
 *     responses:
 *       '200':    
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/Response'
 *       '404':
 *         description: uri not found.
 * components:
 *   Response:
 *     type: 
 *     properties:
 *       status:
 *         type: boolean
 *       result:
 *         type: object
 *     required:
 *     - status
 */

router.use('/appInfo', async (req: Request, res: Response) => {
    const { restAPI } = req.body;
    try {
        response = await appService.appInfo(restAPI);
        if (response.status !== true) throw new Error(response.msg);
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
    }
    res.json(response);
});

/**
 * @openapi
 *  /Oauth/app/getInfoUpdate:
 *   post:
 *     tag:
 *     - modify, application
 *     summary: select information provided
 *     description: select needed data
 *     parameters:
 *       - in: body
 *         name: ''
 *         required: true
 *         description: application's restAPI
 *         schema:
 *           type: object
 *           properties :
 *              getUserInfo :
 *                  type : array
 *                  example : [true, false, true, true, false, false]
 *              restAPI :
 *                  type : string
 *                  example: "ed2bddf3ece5bf7bf4fd134c1fad973"
 *     responses:
 *       '200':    
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/Response'
 *       '404':
 *         description: uri not found.
 * components:
 *   Response:
 *     type: 
 *     properties:
 *       status:
 *         type: boolean
 *       msg:
 *         type: string
 *     required:
 *     - status
 *     - string
 */

router.use('/getInfoUpdate', async (req: Request, res: Response) => {
    const { getUserInfo, restAPI } = req.body;
    try {
        response = await appService.getInfoUpdate(getUserInfo, restAPI);
        if (response.status !== true) throw new Error(response.msg);
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
    }
    res.json(response);
});

/**
 * @openapi
 *  /Oauth/app/updateRedirect:
 *   post:
 *     tag:
 *     - modify, redirectURI, application
 *     summary: save redirectURI
 *     description: select needed data
 *     parameters:
 *       - in: body
 *         required: true
 *         description: application's restAPI
 *         schema:
 *           type: object
 *           properties : 
 *              uris :
 *                  type: array
 *                  example : ['http://localhost:4001','http://localhost:4000','http://localhost:4000','http://localhost:4000','http://localhost:4000']
 *              restAPI : 
 *                type : string
 *                example: "ed2bddf3ece5bf7bf4fd134c1fad973"
 *     responses:
 *       '200':    
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/Response'
 *       '404':
 *         description: uri not found.
 * components:
 *   Response:
 *     type: 
 *     properties:
 *       status:
 *         type: boolean
 *       msg:
 *         type: string
 *     required:
 *     - status
 *     - string
 */

router.post('/updateRedirect', async (req: Request, res: Response) => {
    const { uris, restAPI } = req.body;
    try {
        response = await appService.updateRedirect(uris, restAPI);
        if (response.status !== true) throw new Error(response.msg);
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
    }
    res.json(response);
});

/**
 * @openapi
 *  /Oauth/app/giveUserInfo:
 *   get:
 *     tag:
 *     - VP, application, userInfo
 *     summary: make VP
 *     description: select needed data and make VP to send
 *     parameters:
 *       - in: query
 *         required: true
 *         description: application's information request
 *         schema:
 *           type: string
 *           example: "ed2bddf3ece5bf7bf4fd134c1fad973"
 *     responses:
 *       '200':    
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/Response'
 *       '404':
 *         description: uri not found.
 * components:
 *   Response:
 *     type: 
 *     properties:
 *       status:
 *         type: boolean
 *     required:
 *     - status
 */

router.get('/giveUserInfo', async (req: Request, res: Response) => {
    const { restAPI } = req.query;

    try {
        response = await appService.giveUserInfo(restAPI);
        if (response.status !== true) throw new Error(response.msg);
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
    }
    res.json(response);
});

/**
 * @openapi
 *  /Oauth/app/userdidregister:
 *   post:
 *     tag:
 *     - register, did, application
 *     summary: sync user with specific application
 *     description: sync user with specific application
 *     parameters:
 *       - in: body
 *         required: true
 *         description: information of application, user
 *         schema:
 *           type: object
 *           properties : 
 *              email :
 *                  type: string
 *                  example : "619049@naver.com"
 *              restAPI :
 *                type : string
 *                example: "ed2bddf3ece5bf7bf4fd134c1fad973"
 *              point :
 *                type : integer
 *                example: "50000"
 *              hash :
 *                type : string
 *                example: "ed2bddf3ece5bf7bf4fd134c1fad973"
 *              giveUserInfo :
 *                type : array
 *                example : [true, false, true, false, true, false]     
 *     responses:
 *       '200':    
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/Response'
 *       '404':
 *         description: uri not found.
 * components:
 *   Response:
 *     type: 
 *     properties:
 *       status:
 *         type: boolean
 *       msg:
 *         type: string
 *     required:
 *     - status
 *     - string
 */

router.post('/userdidregister', async (req: Request, res: Response) => {
    // const { restAPI, email, point, hash, giveUserInfo } = req.body;
    try {
        response = await appService.userdidregister(req.body);
        if (response.status !== true) throw new Error(response.msg);
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
    }
    res.json(response);
});

/**
 * @openapi
 *  /Oauth/app/userdidregister:
 *   post:
 *     tag:
 *     - register, did, application
 *     summary: sync user with specific application
 *     description: sync user with specific application
 *     parameters:
 *       - in: body
 *         required: true
 *         description: information of application, user
 *         schema:
 *           type: object
 *           properties : 
 *              email :
 *                  type: string
 *                  example : "619049@naver.com"
 *              restAPI :
 *                type : string
 *                example: "ed2bddf3ece5bf7bf4fd134c1fad973"
 *              point :
 *                type : integer
 *                example: "50000"
 *              hash :
 *                type : string
 *                example: "ed2bddf3ece5bf7bf4fd134c1fad973"
 *              giveUserInfo :
 *                type : array
 *                example : [true, false, true, false, true, false]     
 *     responses:
 *       '200':    
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/Response'
 *       '404':
 *         description: uri not found.
 * components:
 *   Response:
 *     type: 
 *     properties:
 *       status:
 *         type: boolean
 *       msg:
 *         type: string
 *     required:
 *     - status
 *     - string
 */

router.get('/getPoint', async (req: Request, res: Response) => {
    const { restAPI, email } = req.query;
    try {
        response = await appService.getPoint(restAPI, email);
        if (response.status !== true) throw new Error(response.msg);
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
    }
    res.json(response);
});

export default router;
