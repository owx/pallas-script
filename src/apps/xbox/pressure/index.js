#!/usr/bin/env node
import PQueue from 'p-queue';
import  { logger } from '#utils/logger.js';
import { uploadFile } from "./utils.js";
import {
  faceCompareOuter
} from "./core.js";


/**
 * 压测测试
 */
export async function pressureTest(name, size=1, jobTitle="工作人员"){

    let arr=[
  'https://zhyl.mzj.suyu.gov.cn//upload3/20260107/2ebeeffce29d8fd263386575066a9870.jpeg',
    ]
  
    const queue = new PQueue({
      concurrency: 20,
      interval: 1000,
      intervalCap: 5,
    });
  
    for(let i=0; i<1000; i++){
      queue.add(async () => {
        
        let resp = await faceCompareOuter(arr[0]);
        logger.info(i + ". result -> ", resp.data)
  
      });
    }
}

  
/**
 *  测试
 * @param {} name 
 * @param {*} size 
 * @param {*} jobTitle 
 */
export async function requestTest(name, size=1, jobTitle="工作人员"){
    const start = process.hrtime.bigint(); // 返回一个 bigint 类型的纳秒计数

    uploadFile("https://chifeng-nx.njapld.com:7979/admin/obs/uploadFile", "123", "D:\\Temp\\IMG_132154484020447264.jpg" ).then((resp)=>{
    
        const end = process.hrtime.bigint();
        let  elapsed = Number(end - start) / 1e6; // 将纳秒转换为毫秒
        console.log(`异步操作耗时: `  + elapsed );
        console.log(resp.data)
    
    })
}
