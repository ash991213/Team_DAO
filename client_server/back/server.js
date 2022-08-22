const express = require('express');
const cookiePaser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const router = require('./router');
const app = express();
const cors = require('cors');

const port = 4000;

app.use(
    cors({
        origin: '*',
        credentials: true,
    }),
);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookiePaser());
app.use('/api', router);
dotenv.config();
sequelize
    .sync({ force: false })
    .then(() => {
        console.log('데이터베이스 연결 성공!');
    })
    .catch((err) => {
        console.error(err);
    });

app.listen(port, () => {
    console.log('Back Server Running Port 4000  🏃🏻');
});
