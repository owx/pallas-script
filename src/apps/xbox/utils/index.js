#!/usr/bin/env node
// import  { logger } from '#utils/logger.js';
import { qrcodeApp } from './qrcode/index.js';
import { convertSvgToPng } from './svg2png/index.js';

export async function utilsMain(mode, size, input, output){

    switch(mode){
        case 'qrcode':
        case 'qr':
            console.log("start qrcode app...")
            qrcodeApp();
            break;

        case 'svg2png':
        case 's2p':
            console.log("start convertSvgToPng app...")
            // convertSvgToPng("", "");
            break;


        case 'jujia':
            break;

        default:
            console.log("xbox utils -m(mode)")
            console.log("\t-m encrypt|enc : 代码加密")
            console.log("\t-m minio : minio工具测试")
            console.log("\t-m ocr : ocr工具")
            console.log("\t-m oss : oss测试工具")
            console.log("\t-m qrcode|qr : qr工具")
            console.log("\t-m svg2png|s2p : svg图片转png工具")
            break;
    }

}
