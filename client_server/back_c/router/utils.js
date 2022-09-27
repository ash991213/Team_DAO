const filterNull = (uris) => {
    const newRedirectUri = [];
    for (let i = 0; i < uris.length; i++) {
        if (uris[i] !== null) {
            newRedirectUri.push(uris[i]);
        }
    }

    return newRedirectUri;
};

// const oauth_Front = 'http://localhost:8080';
// const oauth_Back = 'http://localhost:8000';
// const frontEnd = 'http://localhost:3002';

const oauth_Front = 'http://teamdid.shop';
const oauth_Back = 'http://43.200.46.217';
const frontEnd = 'http://localhost:3002';

module.exports = { filterNull, oauth_Front, oauth_Back, frontEnd };
