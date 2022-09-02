import { Model } from "sequelize-typescript";
export default class TotalPoint extends Model {
    hashId?: string;
    restAPI?: string;
    point?: number;
}
