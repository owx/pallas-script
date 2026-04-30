#!/usr/bin/env node
import PQueue from 'p-queue';
import fs from 'fs';
import { access } from 'fs/promises';
import { pipeline } from 'stream';
import { promisify } from 'util';
import {
  jujiaVisitServiceQuery,
  jujiaServiceHistory,
  jujiaServiceHistoryExport,
  jujiaServiceQrCodeExport,
} from "../core/mca_core.js";
import { logger } from '#src/utils/LoggerUtils.js'

// const logger = new Logger({ layout: {type: 'pattern', pattern: '%m'} });


const streamPipeline = promisify(pipeline);


async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}


export async function jjServiceQrCodeExport(filePath=".", size=1, current=1, file="oldman.txt", startLine=0){

  // 1. 初始化任务队列
  const queue = new PQueue({
    // intervalCap: 1,   // 每个时间窗口内最多执行的任务数
    // interval: 1000,   // 时间窗口长度（毫秒）
    concurrency: 1     // 并发数（可选，默认 Infinity）
  });
  

  // 2. 通过接口获取服务对象列表
  // let serviceObjListResp = await jujiaVisitServiceQuery(null, size, current);
  // let serviceObjList = serviceObjListResp.data.data.records;


  // 3. 或者通过文件读取服务对象列表
  const data = fs.readFileSync(file, 'utf8');
  let serviceObjList = data.split('\n');
  logger.info("居家上门-综合查询-服务对象列表: ", serviceObjList)

  for(let i=startLine; i<serviceObjList.length; i++){
    let line = serviceObjList[i];

    // if(line.indexOf("成功") > 0){
    //   fsws.write(line + '\n');
    //   continue;
    // }

    let arr = line.split(",");
    let idCard =arr[0].trim();
    // let name =arr[1].trim();
    logger.info('处理idCard->' +  idCard);

    let ahbx1503 = idCard;

    queue.add(async () => {
      const response = await jujiaServiceQrCodeExport(ahbx1503)
      // let fileName =  (size*(current-1) + i+1) + ".（" + ahbx1502 +"）扫码评价二维码.pdf";
      let fileName =  (size*(current-1) + i+1) + "." + "" + "" + ahbx1503 +"-扫码评价二维码.pdf";
      let fullPath = filePath + "\\" + fileName;

      let exists = await fileExists(fullPath);
      if(exists){
        logger.info("【跳过】文件已经存在: ", fileName)
        return;
      }

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


export async function jjAutoJujiaServiceHistoryExport(filePath=".", size=1, current=1, year=2025){

  // 1. 获取已确认费用列表 ， 1 是已确认
  let feeListResp = await jujiaVisitServiceQuery(null, size, current, year);
  let feeList = feeListResp.data.data.records;
  
  logger.info("居家上门-综合查询-服务列表: ", feeList.length)

  
  // 3. 自动审核
  const queue = new PQueue({
    // intervalCap: 1,   // 每个时间窗口内最多执行的任务数
    // interval: 5000,   // 时间窗口长度（毫秒）
    concurrency: 1     // 并发数（可选，默认 Infinity）
  });

  for(let i=0; i<feeList.length; i++){
    let ahbx1501 = feeList[i].ahbx1501;
    let ahbx1502 = feeList[i].ahbx1502;

    queue.add(async () => {
      const response = await jujiaServiceHistoryExport(ahbx1501, year)
      let fileName =  (size*(current-1) + i+1) + ".（" + ahbx1502 +"）居家养老上门服务历史表.xlsx";
      let fullPath = filePath + "\\" + fileName;

      let exists = await fileExists(fullPath);
      if(exists){
        logger.info("【跳过】文件已经存在: ", fileName)
        return;
      }

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




