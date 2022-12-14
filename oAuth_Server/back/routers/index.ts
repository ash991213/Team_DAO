const express = require('express');
import appRouter from './app/app';
import loginRouter from './user/login';
import userRouter from './user/user';
import verifyRouter from './verify/verifyEmail';
import pointRouter from './point/point';


const route = express.Router();

route.use('/app', appRouter);
route.use('/login', loginRouter);
route.use('/user', userRouter);
route.use('/verifyEmail', verifyRouter);
route.use('/point', pointRouter);


export default route;
