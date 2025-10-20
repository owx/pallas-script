
import CryptoJS from "crypto-js";

class EncryptUtil {

    decrypt(encryptData: {encryption: string, timestamp?: string}, token?: string){
        let defaultKey1 = 'j#vcZgVXusQ6MQQS';
        let defaultKey2 = '@/&2,3^_O!ar9r_:';

        if((!token) || (!encryptData.timestamp)){
            // console.log("start exception decrypt 1");
            try{
                return this.aesDecrypt(defaultKey1, encryptData.encryption)
            }catch(e2){
                return this.aesDecrypt(defaultKey2, encryptData.encryption)
            }
        }

        if(token.includes(" ")){
            token = token.split(' ')[1];
        }
        // console.log("token", token);

        try{
            // 一层解密
            const { timestamp } =  encryptData;
            let lastChar = timestamp.charAt(timestamp.length - 1);
            let start = Number(lastChar);
            let key1 = token.substr(start, 16);
            // console.log("key1", key1);

            let firstLevelData = this.aesDecrypt(key1, encryptData.encryption);
            // console.log("firstLevelData", firstLevelData);

            // 二层解密
            lastChar = firstLevelData.charAt(firstLevelData.length - 1);
            start = Number(lastChar);
            let codedKey2 = firstLevelData.substr(start, 36);
            // console.log("codedKey2", codedKey2);

            // let key2Str = Buffer.from(codedKey2, 'base64').toString();
            let key2Str = decodeURIComponent(escape(atob(codedKey2)));
            // console.log("key2Str", key2Str);

            let key2 = key2Str.substring(10);
            // console.log("key2", key2);

            let secordLevelData = firstLevelData.substring(0, firstLevelData.length-1);
            secordLevelData = secordLevelData.substring(0, start) + secordLevelData.substring(start+36);
            // console.log("secordLevelData", secordLevelData);


            let finalLevelData = this.aesDecrypt(key2, secordLevelData);
            // console.log("finalLevelData", finalLevelData);

            return finalLevelData;

        }catch(e){
            // console.log("start exception decrypt 2");
            try{
                return this.aesDecrypt(defaultKey1, encryptData.encryption)
            }catch(e2){
                return this.aesDecrypt(defaultKey2, encryptData.encryption)
            }
        }
    }

    aesDecrypt(keystr: string, data: string){
        const key = CryptoJS.enc.Utf8.parse(keystr);        
        let decryptData = CryptoJS.AES.decrypt(data, key, {
            iv: key,
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.NoPadding
        }).toString(CryptoJS.enc.Utf8);
        
        return decryptData;
    }


}export const encryptUtil = new EncryptUtil();