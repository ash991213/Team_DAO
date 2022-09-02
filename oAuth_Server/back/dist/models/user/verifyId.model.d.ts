import { Model } from 'sequelize-typescript';
export default class VerifyId extends Model {
    hashId?: string;
    email?: string;
    restAPI?: string;
}
