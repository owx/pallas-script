import crypto from 'crypto';

// RSA分段加密的最大块大小（与Java中的MAX_ENCRYPT_BLOCK对应）
// 对于RSA 2048位密钥，最大加密块大小为245字节（2048/8 - 11）

/**
 * RSA最大加密明文大小
 */
const MAX_ENCRYPT_BLOCK = 117;

/**
 * RSA最大解密密文大小
 */
const MAX_DECRYPT_BLOCK = 128;


/**
 * RSA公钥加密
 * @param {string|Buffer} publicKey - PEM格式的公钥
 * @param {Buffer|Uint8Array|string} plainTextData - 要加密的明文数据
 * @returns {Buffer} 加密后的数据
 * @throws {Error} 当公钥无效或加密失败时抛出异常
 */
export async function encrypt(publicKey, plainTextData) {
  if (!publicKey) {
    throw new Error('加密公钥为空, 请设置');
  }

  try {
    // 将输入数据转换为Buffer
    const plainTextBuffer = Buffer.isBuffer(plainTextData) 
      ? plainTextData 
      : Buffer.from(plainTextData);
    
    const inputLen = plainTextBuffer.length;
    const buffers = [];
    let offset = 0;
    let i = 0;

    // 将公钥字符串转换为crypto.KeyObject
    const keyObject = crypto.createPublicKey(publicKey);
    
    // 检查密钥类型
    if (keyObject.asymmetricKeyType !== 'rsa') {
      throw new Error('非RSA公钥, 请检查');
    }

    // 对数据分段加密
    while (inputLen - offset > 0) {
      const chunkSize = (inputLen - offset > MAX_ENCRYPT_BLOCK) 
        ? MAX_ENCRYPT_BLOCK 
        : inputLen - offset;
      
      // 获取当前分段的Buffer
      const chunk = plainTextBuffer.subarray(offset, offset + chunkSize);
      
      // 使用公钥加密当前分段
      // Node.js的publicEncrypt会自动使用PKCS#1填充
      const encryptedChunk = crypto.publicEncrypt(
        {
          key: keyObject,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        chunk
      );
      
      buffers.push(encryptedChunk);
      i++;
      offset = i * MAX_ENCRYPT_BLOCK;
    }

    // 合并所有加密后的分段
    return Buffer.concat(buffers);
    
  } catch (error) {
    // 根据错误类型抛出相应的异常信息
    if (error.code === 'ERR_INVALID_ARG_TYPE') {
      throw new Error('加密公钥非法,请检查');
    } else if (error.code === 'ERR_OSSL_RSA_DATA_TOO_LARGE_FOR_KEY_SIZE') {
      throw new Error('明文长度非法');
    } else if (error.message.includes('key')) {
      throw new Error('加密公钥非法,请检查');
    } else {
      throw new Error(`加密失败: ${error.message}`);
    }
  }
}

/**
 * RSA私钥解密（与加密方法配套使用）
 * @param {string|Buffer} privateKey - PEM格式的私钥
 * @param {Buffer} encryptedData - 加密后的数据
 * @returns {Buffer} 解密后的明文数据
 * @throws {Error} 当私钥无效或解密失败时抛出异常
 */
export async function decrypt(privateKey, encryptedData) {
  if (!privateKey) {
    throw new Error('解密私钥为空, 请设置');
  }

  try {
    const encryptedBuffer = Buffer.isBuffer(encryptedData) 
      ? encryptedData 
      : Buffer.from(encryptedData);
    
    const inputLen = encryptedBuffer.length;
    const keyObject = crypto.createPrivateKey(privateKey);
    const keySize = keyObject.asymmetricKeyDetails?.modulusLength || 2048;
    
    // RSA解密块大小：对于RSA 2048位密钥，解密块大小为256字节
    const MAX_DECRYPT_BLOCK = Math.ceil(keySize / 8);
    
    const buffers = [];
    let offset = 0;
    let i = 0;

    while (inputLen - offset > 0) {
      const chunkSize = (inputLen - offset > MAX_DECRYPT_BLOCK) 
        ? MAX_DECRYPT_BLOCK 
        : inputLen - offset;
      
      const chunk = encryptedBuffer.subarray(offset, offset + chunkSize);
      
      const decryptedChunk = crypto.privateDecrypt(
        {
          key: keyObject,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        chunk
      );
      
      buffers.push(decryptedChunk);
      i++;
      offset = i * MAX_DECRYPT_BLOCK;
    }

    return Buffer.concat(buffers);
    
  } catch (error) {
    if (error.code === 'ERR_OSSL_RSA_DATA_TOO_LARGE_FOR_MODULUS') {
      throw new Error('密文长度非法');
    } else if (error.code === 'ERR_OSSL_RSA_OAEP_DECODING_ERROR') {
      throw new Error('密文数据已损坏');
    } else if (error.message.includes('key')) {
      throw new Error('解密私钥非法,请检查');
    } else {
      throw new Error(`解密失败: ${error.message}`);
    }
  }
}

/**
 * 从十六进制字符串中加载RSA公钥
 * @param {string} publicKeyStr - 十六进制格式的公钥字符串（X509编码）
 * @returns {crypto.KeyObject} RSA公钥对象
 * @throws {Error} 加载公钥时产生的异常
 */
export function loadPublicKeyByStr(publicKeyStr) {
    if (!publicKeyStr) {
      throw new Error('公钥数据为空');
    }
  
    try {
      // 1. 将十六进制字符串转换为Buffer
      const buffer = Buffer.from(publicKeyStr, 'hex');
      
      // 2. 创建X509 SubjectPublicKeyInfo格式的DER编码
      // 注意：输入的hex字符串应该是完整的X509编码，包含算法标识符和公钥位串
      // 3. 将DER编码转换为PEM格式
      const base64Key = buffer.toString('base64');
      const pemKey = `-----BEGIN PUBLIC KEY-----\n` +
                     base64Key.match(/.{1,64}/g).join('\n') + '\n' +
                     `-----END PUBLIC KEY-----\n`;
      
      // 4. 创建并返回KeyObject
      const keyObject = crypto.createPublicKey({
        key: pemKey,
        format: 'pem',
        type: 'pkcs1' // 或 'spki'，取决于具体格式
      });
      
      // 验证是否为RSA密钥
      if (keyObject.asymmetricKeyType !== 'rsa') {
        throw new Error('非RSA公钥');
      }
      
      return keyObject;
      
    } catch (error) {
      // 根据错误类型抛出相应的异常信息
      if (error.message.includes('asn1 encoding')) {
        throw new Error('公钥非法，格式不正确');
      } else if (error.message.includes('too small')) {
        throw new Error('公钥非法，密钥长度过短');
      } else {
        throw new Error(`加载公钥失败: ${error.message}`);
      }
    }
}

// 使用示例：
/*
// 1. 加密示例
const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnzyis1ZjfNB0bBgKFMSv
vkTtwlvBsaJq7S5wA+kzeVOVpVWwkWdVha4s38XM/pa/yr47av7+z3VTmvDRyAHc
aT92whREFpLv9cj5lTeJSibyr/Mrm/YtjCZVWgaOYIhwrXwKLqPr/11inWsAkfIy
tvHWTxZYEcXLgAXFuUuaS3uF9gEiNQwzGTU1v0FqkqTBr4B8nW3HCN47XUu0t8Y0
e+lf4s4OxQawWD79J9/5d3Ry0vbV3Am1FtGJiJvOwRsIfVChDpYStTcHTCMqtvWb
V6L11BWkpzGXSW4Hv43qa+GSYOD2QU68Mb59oSk2OB+BtOLpJofmbGEGgvmwyCI9
MwIDAQAB
-----END PUBLIC KEY-----`;

const plainText = 'Hello, RSA Encryption!';
const encrypted = await encrypt(publicKey, plainText);
console.log('Encrypted (base64):', encrypted.toString('base64'));

// 2. 解密示例（需要私钥）
const privateKey = `-----BEGIN PRIVATE KEY-----
...你的私钥内容...
-----END PRIVATE KEY-----`;
const decrypted = await decrypt(privateKey, encrypted);
console.log('Decrypted:', decrypted.toString());
*/