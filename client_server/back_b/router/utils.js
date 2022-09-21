const filterNull = (uris) => {
    const newRedirectUri = [];
    for (let i = 0; i < uris.length; i++) {
        if (uris[i] !== null) {
            newRedirectUri.push(uris[i]);
        }
    }

    return newRedirectUri;
};

const oauth_Front = 'http://localhost:8080';
const oauth_Back = 'http://localhost:8000';
const frontEnd = 'http://localhost:3001';

module.exports = { filterNull, oauth_Back, oauth_Front, frontEnd };
