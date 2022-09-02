import { Model } from 'sequelize-typescript';
export default class App extends Model {
    owner?: string;
    appName?: string;
    restAPI?: string;
}
