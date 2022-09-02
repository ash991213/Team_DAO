"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Provider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const DID = require('./contracts/DID.json');
require('dotenv').config();
const provider = new Provider(process.env.MNEMONIC, process.env.OPTIMISM_GOERLI_URL);
const web3 = new Web3(provider);
const deployed = () => __awaiter(void 0, void 0, void 0, function* () {
    const networkId = yield web3.eth.net.getId();
    const abi = DID.abi;
    const CA = DID.networks[networkId].address;
    const deploy = new web3.eth.Contract(abi, CA);
    return deploy;
});
exports.default = deployed;
