import crypto from 'crypto';
import TotalPoint from '../../models/user/totalPoint.model';
import VerifyId from '../../models/user/verifyId.model';
import App from '../../models/webSite/app.model';
import DataNeeded from '../../models/webSite/dataNeeded.model';
import RedirectURI from '../../models/webSite/redirectURI.model';
import { responseObject } from '../../routers/app/utils';
import deployed from '../../web3';

let response: any;

const oAuthRegister = async (data: any) => {
    const { email, password, gender, name, age, addr, mobile } = data;
    try {
        const userHash = email + password;
        const hash = crypto.createHash('sha256').update(userHash).digest('base64');

        const DATA = {
            email,
            gender,
            name,
            age,
            addr,
            mobile,
        };
        const contract = await deployed();
        await contract.methods.registerUser(hash, DATA).send({
            from: process.env.WALLET_ADDRESS,
        });

        const result = await contract.methods.isRegistered(hash).call();
        if (!result) throw new Error('회원 가입에 실패했습니다.');

        await VerifyId.create({
            email,
        });

        response = responseObject(true,'회원 가입이 완료되었습니다.');
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
        response = responseObject(false, e.message);
    }
    return response;
};

const upDatePassword = async(data: any) => {
    const { hashId, email, newPw } = data;

    try {
        const newpasswordId = email + newPw;
        const newHash = crypto.createHash('sha256').update(newpasswordId).digest('base64');

        const contract = await deployed();
        await contract.methods.updatePassword(hashId, newHash).send({
            from: process.env.WALLET_ADDRESS,
            gas: 10000000
        });

        response = responseObject(true, '비밀번호 변경이 완료되었습니다.');
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
        response = responseObject(false,'비밀번호 변경이 실패하였습니다.');
    }
    return response;
}

const upDateUser = async (data: any) => {
    const { gender, name, age, addr, mobile, email, hashId } = data;

    try {
        const DATA = {
            gender,
            name,
            age,
            addr,
            mobile,
            email,
        };

        const contract = await deployed();
        const checkUser = await contract.methods.isRegistered(hashId).call();
        if (checkUser) {
            await contract.methods.updateUser(hashId, DATA).send({
                from: process.env.WALLET_ADDRESS,
                gas: 10000000,
            });

            const result = await contract.methods.getUser(hashId).call();

            response = {
                status: true,
                name: result[1],
                age: result[2],
                gender: result[0],
                addr: result[3],
                mobile: result[4],
                msg: '회원정보가 변경되었습니다.',
            }
        }
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
            response = responseObject(false,'회원정보를 변경하지 못하였습니다.')
    }
}

const searchUser = async (hashId: string) => {
    try {
        const contract = await deployed();
        const result = await contract.methods.getUser(hashId).call();

        response = {
            status: true,
            name: result[1],
            age: result[2],
            gender: result[0],
            addr: result[3],
            mobile: result[4],
        };
    } catch (e) {
        if (e instanceof Error) console.log(e.message);
        response = responseObject(false, '유저 정보를 불러오는데 실패하였습니다.');
    }
};

const deleteUser = async(hashId: string, email: string) => {
    try {
        const contract = await deployed();
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
}

const userService = {
    oAuthRegister,
    upDatePassword,
    upDateUser,
    searchUser,
    deleteUser,
};

export default userService;
