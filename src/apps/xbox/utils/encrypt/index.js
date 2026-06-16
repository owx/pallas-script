#!/usr/bin/env node
import { authenticator } from "./auth/index.js";
import { encryptUtil } from "#utils/EncryptUtil.ts";
// const aplid = require('./xxtea.js')

// let str= "bA4F3yC7gJxXy0NuMlDlrg==";
// let data = aplid.xxtea_decrypt(str);

// console.log(data)

// authenticator();

export function encApp() {

    // authenticator();

    const data = encryptUtil.decrypt({
        encryption: 'S1J7/L4iDgFT4ce2TSHugf1Vf7XMhDkUakP2Oh1jDu+2Hv5PzOq0ogZKf9ukw56iVUg3bpabLXBbo03eQl0lJKXuF+g+Mw18i27cUlSHuweu',
        timestamp: '1759972447'
    }, "0006456e-160b-492a-af35-c822c0583302");

    console.log(data);

}