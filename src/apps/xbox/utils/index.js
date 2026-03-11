#!/usr/bin/env node
// import  { logger } from '#utils/logger.js';
import { convertSvgToPng } from './svg2png/index.js';

export async function utilsMain(mode, size, input, output){

    switch(mode){
        case 'svg2png':
        case 's2p':
            console.log("convertSvgToPng")
            // convertSvgToPng("", "");
            break;

        case 'jujia':
            break;

        default:
            convertSvgToPng(input, output, { width: 200, height: 200 });
            break;
    }

}
