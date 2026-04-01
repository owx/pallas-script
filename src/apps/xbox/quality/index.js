#!/usr/bin/env node
// import  { logger } from '#utils/logger.js';

export async function qaMain(mode, size, input, output){

    switch(mode){
        case 'qrcode':
        case 'qr':
            console.log("start qrcode app...")
            // qrcodeApp();
            break;

        case 'svg2png':
        case 's2p':
            console.log("start convertSvgToPng app...")
            // convertSvgToPng("", "");
            break;

        default:
            console.log("xbox qa -m(mode)")
            console.log("\t-m keywordscan|ks : 关键字扫描")
            console.log("\t-m pressure|pr : 接口压测")
            console.log("\t-m sast : 静态代码扫描")
            break;
    }

}
