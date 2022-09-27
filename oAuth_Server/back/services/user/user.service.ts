import crypto from 'crypto';
import TotalPoint from '../../models/user/totalPoint.model';
import VerifyId from '../../models/user/verifyId.model';
import App from '../../models/webSite/app.model';
import DataNeeded from '../../models/webSite/dataNeeded.model';
import RedirectURI from '../../models/webSite/redirectURI.model';
import { responseObject } from '../../routers/app/utils';
import deployed from '../../web3';
import { encrypt, decrypt } from '../utils/hash.service';

let response: any;

const oAuthRegister = async (data: any) => {
    const { email, password, gender, name, age, addr, mobile } = data;
    try {
        const userHash = email + password;
        const hash = crypto.createHash('sha256').update(userHash).digest('base64');

        const DATA = {
            email: encrypt(email),
            gender: encrypt(gender),
            name: encrypt(name),
            age: encrypt(age),
            addr: encrypt(addr),
            mobile: encrypt(mobile),
        };

        const contract = await deployed;

        await contract.methods.registerUser(hash, DATA).send({
            from: process.env.WALLET_ADDRESS,
        });

        const result = await contract.methods.isRegistered(hash).call();
        if (!result) throw new Error('회원 가입에 실패했습니다.');

        await VerifyId.create({
            email,
        });

        response = responseObject(true, '회원 가입이 완료되었습니다.');
    } catch (e) {
        if (e instanceof Error) console.log(e);
        response = responseObject(false, e.message);
    }
    return response;
};

const upDatePassword = async (data: any) => {
    const { hashId, email, newPw } = data;

    try {
        const newpasswordId = email + newPw;
        const newHash = crypto.createHash('sha256').update(newpasswordId).digest('base64');

        const contract = await deployed;
        await contract.methods.updatePassword(hashId, newHash).send({
            from: process.env.WALLET_ADDRESS,
            gas: 10000000,
        });

        response = responseObject(true, '비밀번호 변경이 완료되었습니다.');
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
        response = responseObject(false, '비밀번호 변경이 실패하였습니다.');
    }
    return response;
};

const upDateUser = async (data: any) => {
    const { gender, name, age, addr, mobile, email, hashId } = data;

    try {
        const DATA = {
            email: encrypt(email),
            gender: encrypt(gender),
            name: encrypt(name),
            age: encrypt(age),
            addr: encrypt(addr),
            mobile: encrypt(mobile),
        };

        console.log(DATA);

        const contract = await deployed;
        const checkUser = await contract.methods.isRegistered(hashId).call();
        if (checkUser) {
            await contract.methods.updateUser(hashId, DATA).send({
                from: process.env.WALLET_ADDRESS,
                gas: 10000000,
            });

            const result = await contract.methods.getUser(hashId).call();

            console.log('result', result);

            response = {
                status: true,
                name: decrypt(result[1]),
                age: decrypt(result[2]),
                gender: decrypt(result[0]),
                addr: decrypt(result[3]),
                mobile: decrypt(result[4]),
                msg: '회원정보가 변경되었습니다.',
            };

            console.log('response', response);
        }
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
        response = responseObject(false, '회원정보를 변경하지 못하였습니다.');
    }
    return response;
};

const searchUser = async (hashId: string) => {
    try {
        const contract = await deployed;
        const result = await contract.methods.getUser(hashId).call();

        response = {
            status: true,
            name: decrypt(result[1]),
            age: decrypt(result[2]),
            gender: decrypt(result[0]),
            addr: decrypt(result[3]),
            mobile: decrypt(result[4]),
        };
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
        response = responseObject(false, '유저 정보를 불러오는데 실패하였습니다.');
    }
    return response;
};

const deleteUser = async (hashId: string, email: string) => {
    try {
        const contract = await deployed;
        await contract.methods.deleteUser(hashId).send({
            from: process.env.WALLET_ADDRESS,
            gas: 10000000,
        });
        const checkUser = await contract.methods.isRegistered(hashId).call();
        if (checkUser) throw new Error('회원 탈퇴 처리 실패');
        const deleteApp = await App.findAll({
            where: { owner: email },
        });

        for (let i = 0; i < deleteApp.length; i++) {
            await DataNeeded.destroy({
                where: {
                    restAPI: deleteApp[i].restAPI,
                },
            });
            await RedirectURI.destroy({
                where: {
                    restAPI: deleteApp[i].restAPI,
                },
            });
        }

        await App.destroy({
            where: {
                owner: email,
            },
        });

        await TotalPoint.destroy({ where: { email: email } });
        await VerifyId.destroy({ where: { email: email } });

        response = responseObject(true, '회원 탈퇴가 완료되었습니다.');
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
        response = responseObject(false, '회원 탈퇴에 실패했습니다.');
    }
    return response;
};

const userService = {
    oAuthRegister,
    upDatePassword,
    upDateUser,
    searchUser,
    deleteUser,
};

export default userService;
