#!/usr/bin/env node
import PQueue from 'p-queue';
import  { logger } from '#utils/logger.js';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

import {
  jujiaFeeConfirmList,
  jujiaFeeHistoryList,
  jujiaFeeHistoryExport
} from "../core/mca_core.js";

const streamPipeline = promisify(pipeline);

export async function jjAutoJujiaFeeHistoryExport(filePath=".", size=1){

  // 1. 获取已确认费用列表 ， 1 是已确认
  let feeListResp = await jujiaFeeConfirmList(1, size);
  let feeList = feeListResp.data.data.records;
  
  logger.info("居家上门-服务费用确认-已确认列表: ", feeList.length)

  
  // 3. 自动审核
  const queue = new PQueue({ concurrency: 1 });

  for(let i=0; i<feeList.length; i++){
    let ahbx1501 = feeList[i].ahbx1501;
    let ahbx1502 = feeList[i].ahbx1502;

    queue.add(async () => {
      const response = await jujiaFeeHistoryExport(ahbx1501)
      let fileName = "（" + ahbx1502 +"）历史费用表.xlsx";
      let fullPath = filePath + "\\" + fileName;
      try {
        // 确保 responseType 是 'stream'
        if (response.config.responseType !== 'stream') {
          throw new Error('responseType 必须是 stream');
        }
    
        // 使用 pipeline 管理流
        await streamPipeline(response.data, fs.createWriteStream(fullPath));
        
        console.log(`Excel 文件已保存: ${fullPath}`);
        return fullPath;
        
      } catch (error) {
        throw new Error(`保存失败: ${error.message}`);
      }
    })

  }

}


//鲍菊珍

// 652722196011200400
//阿米娜·沙依提
// 费用确认： 作废-》否
// https://ylfw.mca.gov.cn/ylapi/ylpt/v24Visitingallocate/expenseVerify?jjsm0601=b10bb2257ea94229949d85b2ac435454&ahbx1501=c3a71ac35bc34f48850fb0ac2397be10&jjsm0603=95&jjsm0625=0&jjsm0609=50
// jjsm0601=b10bb2257ea94229949d85b2ac435454&ahbx1501=c3a71ac35bc34f48850fb0ac2397be10&jjsm0603=95&jjsm0625=0&jjsm0609=50

//https://ylfw.mca.gov.cn/ylapi/ylpt/v24Visitingallocate/expenseVerify?jjsm0601=570f855fd1414fce91bfa0ab39c3a0a4&ahbx1501=e34f2c7a204a49418ebc0b2a2aac37c5&jjsm0603=328&jjsm0625=1&jjsm0609=0&jjsm0626=%E8%B6%85%E6%97%B6
