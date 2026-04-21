#!/usr/bin/env node
import PQueue from 'p-queue';
import Logger from '#src/utils/LoggerUtils.js'

const logger = new Logger({ layout: {type: 'pattern', pattern: '%m'} });


import {
  hbIntegratedQuery,
  hbIntegratedQueryDetails,
} from "../core/mca_core.js";


export async function hbAutoJiaChuangSatisfaction(filePath=".", size=1, current=1){

  // 1. 获取已确认费用列表 ， 1 是已确认
  let feeListResp = await hbIntegratedQuery(size, current);
  let feeList = feeListResp.data.data.records;
  
  logger.info("家床建设-综合查询-列表: ", feeList.length)

  // 3. 自动审核
  const queue = new PQueue({ concurrency: 1 });

  for(let i=0; i<feeList.length; i++){
    // let ahbx1501 = feeList[i].ahbx1501;
    // let ahbx1502 = feeList[i].ahbx1502;

    // queue.add(async () => {
    //   const response = await jujiaServiceHistoryExport(ahbx1501)
    //   let fileName =  (size*(current-1) + i+1) + ".（" + ahbx1502 +"）居家养老上门服务历史表.xlsx";
    //   let fullPath = filePath + "\\" + fileName;

    //   let exists = await fileExists(fullPath);
    //   if(exists){
    //     logger.info("【跳过】文件已经存在: ", fileName)
    //     return;
    //   }

    //   try {
    //     // 确保 responseType 是 'stream'
    //     if (response.config.responseType !== 'stream') {
    //       throw new Error('responseType 必须是 stream');
    //     }
    
    //     // 使用 pipeline 管理流
    //     await streamPipeline(response.data, fs.createWriteStream(fullPath));
        
    //     console.log(`Excel 文件已保存: ${fullPath}`);
    //     return fullPath;
        
    //   } catch (error) {
    //     throw new Error(`保存失败: ${error.message}`);
    //   }
    // })

  }

}




