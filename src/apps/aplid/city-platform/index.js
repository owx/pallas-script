#!/usr/bin/env node
import { processImplementImages } from './homebed/implement.js';

export async function cpMain(mode, limit, output) {
    
    switch(mode){

        case 'homebed':
        default:
            // 下载指定 施工单位 的， 实施改造阶段的图片（改造前、改造后、环境情况）
            processImplementImages("国中盛鼎", limit);
            break;
    }
}
