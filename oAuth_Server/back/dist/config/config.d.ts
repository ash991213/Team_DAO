import { SequelizeOptions } from 'sequelize-typescript';
interface Ioptions {
    development: SequelizeOptions;
    production: SequelizeOptions;
}
declare const options: Ioptions;
export default options;
