
import { se } from 'date-fns/locale';
import speakeasy from 'speakeasy';
import protobuf from 'protobufjs';
import fs from 'fs';
import { OAuth2Client } from 'google-auth-library';



export function authenticator(){

    const url = new URL('otpauth-migration://offline?data=Cj0KCsJ3JAsK7%2BdQvPISGTU4LjIxMy4xNDEuMjM2OmR4LWxpdWZlbmcaDjU4LjIxMy4xNDEuMjM2IAEoATACEAEYASAAKJWnyOEF');
    const base64Data = url.searchParams.get('data');
    

    parseMigrationData(base64Data).then((data)=>{
        console.log(data)

        const base32Secret = bufferToBase32(data.otpParameters[0].secret);
        console.log('Base32 Secret:', base32Secret);
    })
    
    
    // async function decodeMigrationData(base64Data) {
    //   // 1. 加载 protobuf 定义（需 Google 的 proto 文件）
    //   const root = await protobuf.load('google_auth.proto');
    //   const MigrationPayload = root.lookupType('googleauth.MigrationPayload');
    
    //   // 2. Base64 解码为二进制
    //   const binaryData = Buffer.from(base64Data, 'base64');
    
    //   // 3. 解析 protobuf
    //   const payload = MigrationPayload.decode(binaryData);
    //   return MigrationPayload.toObject(payload);
    // }
    
    // let data = decodeMigrationData(base64Data)
    
    
    // function getSecretFromOTPAuthUrl(otpauthUrl) {
    //   const url = new URL(otpauthUrl);
    //   const params = new URLSearchParams(url.search);
    //   return params.get('secret'); // 返回 Base32 编码的密钥
    // }
    
    
    // const secret = getSecretFromOTPAuthUrl(url);
    
    const secret = 'YJ3SICYK57TVBPHS';
    console.log(secret)
    
    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    
    console.log('Current OTP:', token);
    
    
}

async function parseMigrationData(base64Data) {
    // 加载proto定义
    const root = await protobuf.load('E:\\repo\\pallas-script\\src\\apps\\encrypt\\auth\\gauth_migration.proto');
    const MigrationPayload = root.lookupType('googleauth.MigrationPayload');
  
    // 解码
    const buffer = Buffer.from(base64Data, 'base64');
    const payload = MigrationPayload.decode(buffer);
    
    return MigrationPayload.toObject(payload, {
      longs: String,
      enums: String,
      bytes: Buffer
    });
}
  
function bufferToBase32(buffer) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let bits = 0, value = 0;
  
    for (const byte of buffer) {
      value = (value << 8) | byte;
      bits += 8;
  
      while (bits >= 5) {
        result += alphabet[(value >>> (bits - 5)) & 0x1f];
        bits -= 5;
      }
    }
  
    if (bits > 0) {
      result += alphabet[(value << (5 - bits)) & 0x1f];
    }
  
    return result;
}
  