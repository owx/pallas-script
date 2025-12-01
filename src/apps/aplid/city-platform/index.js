#!/usr/bin/env node
import { processImplementImages } from './homebed/hb_implement.js';
import { processEnvAssessImages } from './homebed/hb_env_assess.js';

export async function cpMain(mode, limit, output) {
    
    switch(mode){

        case 'a':
        case 'assess':
            //环境评估照片批量下载
            processEnvAssessImages("", 1);
            break;

        case 'i':
        case 'implement':
            // 下载指定 施工单位 的， 实施改造阶段的图片（改造前、改造后、环境情况）
            processImplementImages("国中盛鼎", limit);
            break;

        default:
            console.log("请指定运行方式！")
            break;
    }
}
