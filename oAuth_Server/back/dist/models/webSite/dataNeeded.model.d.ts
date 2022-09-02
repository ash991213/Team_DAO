import { Model } from 'sequelize-typescript';
export default class DataNeeded extends Model {
    restAPI?: string;
    gender?: boolean;
    age?: boolean;
    name?: boolean;
    mobile?: boolean;
    email?: boolean;
    addr?: boolean;
}
