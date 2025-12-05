import forge from 'node-forge';
import fs from 'fs';

export function extractFromPFX(pfxPath, passphrase) {
    try {
        // 读取 PFX 文件
        const pfxData = fs.readFileSync(pfxPath, 'binary');
        
        // 解码 PFX
        const p12Asn1 = forge.asn1.fromDer(pfxData, false);
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passphrase);
        
        // 提取私钥和证书
        const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
        
        let privateKey = null;
        let certificate = null;
        let publicKey = null;
        
        // 获取私钥
        if (bags[forge.pki.oids.pkcs8ShroudedKeyBag]) {
            const bag = bags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
            if (bag.key) {
                privateKey = bag.key;
                console.log('私钥已提取');
            }
        }
        
        // 获取证书
        if (certBags[forge.pki.oids.certBag]) {
            const certBag = certBags[forge.pki.oids.certBag][0];
            if (certBag.cert) {
                certificate = certBag.cert;
                publicKey = certificate.publicKey;
                console.log('证书已提取');
                                console.log('主题:', certificate.subject.attributes);
                console.log('颁发者:', certificate.issuer.attributes);
            }
        }
        
        // 尝试从其他 bag 类型查找私钥
        if (!privateKey) {
            const keyBags = p12.getBags({ bagType: forge.pki.oids.keyBag });
            if (keyBags[forge.pki.oids.keyBag]) {
                const bag = keyBags[forge.pki.oids.keyBag][0];
                if (bag.key) {
                privateKey = bag.key;
                }
            }
        }
        
        return {
            privateKey: privateKey ? forge.pki.privateKeyToPem(privateKey) : null,
            publicKey: publicKey ? forge.pki.publicKeyToPem(publicKey) : null,
            certificate: certificate ? forge.pki.certificateToPem(certificate) : null,
            raw: {
                privateKey,
                certificate
            }
        };

        } catch (error) {
            console.error('PFX 解析失败:', error.message);
            return null;
    }
}

// 使用示例
// const result = extractFromPFX('certificate.pfx', 'your-password');
// if (result) {
//   console.log('私钥 PEM:\n', result.privateKey);
//   console.log('公钥 PEM:\n', result.publicKey);
//   console.log('证书 PEM:\n', result.certificate);
// }