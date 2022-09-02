import { Sequelize } from 'sequelize-typescript';
import options from '../config/config';
import VerifyId from './user/verifyId.model';
import DataNeeded from './webSite/dataNeeded.model';

const mode = process.env.NODE_ENV === 'production' ? process.env.NODE_ENV : 'development';
const config = options[mode];

const sequelize = new Sequelize({
    ...config,
});

sequelize.addModels([VerifyId]);

sequelize.addModels([DataNeeded]);

export default sequelize;
