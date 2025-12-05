import { extractFromPFX } from "#src/utils/GonganUtils.js"

export async function test(params) {
    console.log("gongan test program")

    // 使用示例
    const result = extractFromPFX('D:/temp/cazs.pfx', 'Aplid@123');
    if (result) {
    console.log('私钥 PEM:\n', result.privateKey);
    console.log('公钥 PEM:\n', result.publicKey);
    console.log('证书 PEM:\n', result.certificate);
    }

}