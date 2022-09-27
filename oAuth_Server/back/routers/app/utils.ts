import crypto from 'crypto';
import DataNeeded from '../../models/webSite/dataNeeded.model';
import RedirectURI from '../../models/webSite/redirectURI.model';
import deployed from '../../web3';
import  {cipher, decipher } from '../../services/utils/hash.service';

export const makeRedirectUriList = (length: any) => {
    let tempRedirectUri = new Array(length);
    for (let i = 0; i < tempRedirectUri.length; i++) {
        tempRedirectUri[i] = null;
    }

    return tempRedirectUri;
};

export const generateHash = (appName: string, email: string) => {
    const randomNum = Math.floor(Math.random() * 1000000);
    const forRestAPI = appName + email + randomNum;
    const randomNum2 = Math.floor(Math.random() * 1000000) + 1000000;
    const forSecret = appName + email + randomNum2;

    const REST_API = crypto.createHmac('sha256', forRestAPI).digest('hex').substr(0, 31);
    const client_secret = crypto.createHmac('sha256', forSecret).digest('hex').substr(0, 31);

    const appCodes = [REST_API, client_secret];
    return appCodes;
};

export const responseObject = (status: boolean, msg: string) => {
    return {
        status,
        msg,
    };
};

export const infoStringToBool = (getUserInfo: any) => {
    const getInfoBool = [];
    for (let i = 0; i < getUserInfo.length; i++) {
        if (getUserInfo[i].get == true) {
            getInfoBool.push(1);
        } else {
            getInfoBool.push(0);
        }
    }
    return getInfoBool;
};

export const boolToNum = (infoArray: any) => {
    let reqVP: any = [];
    for (let i = 0; i < infoArray.length; i++) {
        if (infoArray[i] == true) {
            reqVP.push(1);
        } else {
            reqVP.push(0);
        }
    }

    return reqVP;
};

export const noWhiteSpace = (uri: any) => {
    for (let i = 0; i < uri.length; i++) {
        if (uri[i] !== null) {
            uri[i] = uri[i].trim();
        }
    }
    return uri;
};

export const filterNull = (uris: any) => {
    const newRedirectUri = [];
    for (let i = 0; i < uris.length; i++) {
        if (uris[i] !== null && uris[i] !== '') {
            newRedirectUri.push(uris[i]);
        }
    }
    return newRedirectUri;
};

export const insertNewUri = async (restAPI: string, uris: any) => {
    for (let i = 0; i < uris.length; i++) {
        const newInsert = await RedirectURI.create({
            restAPI: restAPI,
            redirectURI: uris[i],
        });
    }
};

export const getUserinfo = async (restAPI: string, hash: string) => {
    const getUserInfo = await DataNeeded.findOne({
        where: {
            restAPI: restAPI,
        },
    });

    const infoArray = [getUserInfo?.gender, getUserInfo?.name, getUserInfo?.age, getUserInfo?.addr, getUserInfo?.mobile, getUserInfo?.email];
    let reqVP: any = [];
    for (let i = 0; i < infoArray.length; i++) {
        if (infoArray[i] == true) {
            reqVP.push(1);
        } else {
            reqVP.push(0);
        }
    }

    const contract = await deployed;
    const VP = await contract.methods.getVP(hash, reqVP).call();

    let vpObjects = [
        { att: 'gender', value: cipher(VP.gender) },
        { att: 'name', value: cipher(VP.name) },
        { att: 'age', value: cipher(VP.age) },
        { att: 'addr', value: cipher(VP.addr) },
        { att: 'mobile', value: cipher(VP.mobile) },
        { att: 'email', value: cipher(VP.email) },
    ];

    return vpObjects;
};

export const refineVP = (rawVP: any) => {
    let refinedVP = [];

    for (let i = 0; i < rawVP.length; i++) {
        if (rawVP[i].value !== '' && rawVP[i].value !== '0') refinedVP.push(rawVP[i]);
    }
    return refinedVP;
};

export const rawVP = (infoReq: any) => {
    const rawVP = [
        { att: 'email', value: infoReq.email },
        { att: 'name', value: infoReq.name },
        { att: 'age', value: infoReq.age },
        { att: 'gender', value: infoReq.gender },
        { att: 'mobile', value: infoReq.mobile },
        { att: 'addr', value: infoReq.addr },
    ];

    return rawVP;
};

export const filterNotNeeded = (infos: any) => {
    for (let i = 0; i < infos.length; i++) {
        if (infos[i].value == false) {
            delete infos[i];
        }
    }
    return infos;
};

export const makeRawVP = (VP: any) => {
    let rawVP = [
        { att: 'gender', value: cipher(VP.gender) },
        { att: 'name', value: cipher(VP.name) },
        { att: 'age', value: cipher(VP.age) },
        { att: 'addr', value: cipher(VP.addr) },
        { att: 'mobile', value: cipher(VP.mobile) },
        { att: 'email', value: cipher(VP.email) },
    ];
    return rawVP;
};
