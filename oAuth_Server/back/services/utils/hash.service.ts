import crypto from 'crypto';

// const IV_LENGTH = 16;

const cipher = (data: string | number) => {
    const encrypt = crypto.createCipher('des', process.env.SECRET_KEY); // des알고리즘과 키를 설정
    const encryptResult =
        encrypt.update(data, 'utf8', 'base64') + // 암호화
        encrypt.final('base64'); // 인코딩

    console.log(encryptResult);
    return encryptResult;
};

// function encrypt(data: any) {
//     const iv = crypto.randomBytes(IV_LENGTH);
//     const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
//     const encrypted = cipher.update(data);

//     return iv.toString('hex') + ':' + Buffer.concat([encrypted, cipher.final()]).toString('hex');
// }

const decipher = (data: string | number) => {
    if (data === '') return '';
    const decode = crypto.createDecipher('des', process.env.SECRET_KEY);
    const decodeResult =
        decode.update(data, 'base64', 'utf8') + // 암호화된 문자열, 암호화 했던 인코딩 종류, 복호화 할 인코딩 종류 설정
        decode.final('utf8'); // 복호화 결과의 인코딩

    console.log(decodeResult);
    return decodeResult;
};

// function decrypt(data: any) {
//     const textParts = data.split(':');
//     const iv = Buffer.from(textParts.shift(), 'hex');
//     const encryptedText = Buffer.from(textParts.join(':'), 'hex');
//     const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
//     const decrypted = decipher.update(encryptedText);

//     return Buffer.concat([decrypted, decipher.final()]).toString();
// }

export { cipher, decipher };
