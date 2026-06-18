#!/usr/bin/env node
import PQueue from 'p-queue';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { logger } from '#utils/LoggerUtils.js'
import { fileExists, downloadFile } from '#src/utils/FileUtils.js';
import {
  getFileDownloadUrl,
  jujiaVisitServiceQuery,
  jujiaServiceHistory,
  jujiaServiceInfoDetails,
  jujiaServiceHistoryExport,
  jujiaServiceQrCodeExport,
} from "../core/mca_core.js";
import { error } from 'console';

const streamPipeline = promisify(pipeline);


// 1. 通用任务-所有业务都用
const queue = new PQueue({
  // intervalCap: 1,   // 每个时间窗口内最多执行的任务数
  // interval: 1000,   // 时间窗口长度（毫秒）
  concurrency: 1,      // 并发数（可选，默认 Infinity）
});

// 2. 专用任务-照片导出，依次处理老人的上门服务记录
const dlQueue = new PQueue({
  intervalCap: 1,
  interval: 1000,
  concurrency: 1,
});

// 2. 专用任务-照片导出，依次下载老人上门服务记录中的服务历史照片
const picDlQueue = new PQueue({
  // intervalCap: 20,
  // interval: 1000,
  concurrency: 10,
});


/*******************************************************  居家上门-服务历史照片导出  *****************************************************************/


async function downloadFileWithId(ahbx1904, fullPath, retryFlag) {
  // if(fs.existsSync(fullPath)){
  //   logger.info(`文件已存在: ${fullPath} - 跳过`);
  //   return;
  // }
  try{
    const resp3 = await getFileDownloadUrl(ahbx1904)
    let fileUrl = resp3.data.data;
    const response = await downloadFile(fileUrl, fullPath);
    // logger.info(`下载成功: ${fullPath}`);
  }catch(err){
    if(retryFlag==null){
      retryFlag=1;
    }else{
      retryFlag++;
    }
    if(retryFlag>10){
      logger.info(`下载重试10次仍失败: ${fullPath}，` + error);
      throw new Error("下载重试10次仍失败，"+ error);
    }

    logger.info(`下载失败，重试(${retryFlag}): ${fullPath}`);
    await downloadFileWithId(ahbx1904, fullPath, retryFlag)
  }
}

/**
 * 根据服务详情中的开始和结束列表下载相关图片
 * 
 * @param {*} serviceInfo 
 * @param {*} path 
 */
async function downloadFileByServiceInfo(serviceInfo, basePath){

  const startList = serviceInfo.startList;
  const endList = serviceInfo.endList;
  
  for(let s=0; s<startList.length; s++){
    let ahbx1904 = startList[s].ahbx1904;
    picDlQueue.add(async ()=>{
      downloadFileWithId(ahbx1904, basePath + "/img_s_" + s + ".jpeg")
    })
  }

  for(let e=0; e<endList.length; e++){
    let ahbx1904 = endList[e].ahbx1904;
    picDlQueue.add(async ()=>{
      downloadFileWithId(ahbx1904, basePath + "/img_e_" + e + ".jpeg")
    })
  }
}

/**
 * 居家上门-服务历史照片导出
 */
export async function jjServicePhotoExport( page=1, size=1, total=null, file=null, output=".", year=2025, areaCode){
  console.log("居家上门-服务历史照片导出")
  let serviceObjIdcardList = [];

  const fsws = fs.createWriteStream('output.txt', {
    encoding: 'utf8',
    flags: 'w' // 'w' 写入, 'a' 追加
  });
  fsws.on('open', () => {
    console.log('文件流已打开');
  });
  fsws.on('ready', () => {
    console.log('文件流已准备就绪');
  });
  fsws.on('finish', () => {
    console.log('所有数据已写入');
  });
  fsws.on('error', (err) => {
    console.error('流写入错误:', err);
  });

  // 1. 确定名单是从文件读取还是自己查询
  if(file==null){
    // 1.1 将接口获取的数据保存到文件，后面通过文件处理

    // 1.1. 通过接口获取服务对象列表
    console.log("未指定文件，直接从接口查询名单")

    let serviceObjListResp = await jujiaVisitServiceQuery(areaCode, null, 30, size, page, year);
    let serviceObjList = serviceObjListResp.data.data.records;
    // logger.info("居家上门-综合查询-服务对象列表: ", serviceObjList)
    for(let i=0; i<serviceObjList.length; i++){
      const idCard = serviceObjList[i].ahbx1503;
      const ahbx1501 = serviceObjList[i].ahbx1501;
      const areaCodeName = serviceObjList[i].areaCodeName;
      const record = idCard + ',' + ahbx1501 + ',' + areaCodeName;
      // serviceObjIdcardList.push(record);
      fsws.write(record + "\n")
    }
    // 不处理，先生成文件，然后再处理
    return;
  }else{
    // 1.2. 通过文件读取服务对象列表
    console.log("指定文件，直接从文件获取名单")

    const data = fs.readFileSync(file, 'utf8');
    let serviceObjList = data.split('\n');
    // logger.info("居家上门-综合查询-服务对象列表: ", serviceObjList)
    for(let i=0; i<serviceObjList.length; i++){
      const line = serviceObjList[i];
      const arr = line.split(",");
      const idCard =arr[0].trim();
      const ahbx1501 =arr[1].trim();
      const areaCodeName =arr[2].trim();
      serviceObjIdcardList.push(line);
    }
  }
  logger.info("居家上门-综合查询-服务对象列表: ", serviceObjIdcardList.length)


  // 2. 创建导出任务
  for(let i=0; i<serviceObjIdcardList.length; i++){
    let record = serviceObjIdcardList[i];
    const arr = record.split(',');
    let idCard = arr[0];
    let ahbx1501 = arr[1];
    let areaCodeName =arr[2];
    let status =arr[3];

    if(status == "done"){
      // fsws.write(record + "\n")
      logger.info(`处理idCard->${idCard} - ${i} - skip`);
      continue;
    }
    logger.info(`处理idCard->${idCard} - ${i} - processing`);


    queue.add(async () => {
      // 2.1 查询服务历史
      const resp1 = await jujiaServiceHistory(ahbx1501, 500, year)
      const serviceHistoryList = resp1.data.data.records
      // console.log(serviceHistoryList);

      for(let j=0; j<serviceHistoryList.length; j++){
        const idx = serviceHistoryList.length - j;
        let jjsm0601 = serviceHistoryList[j].jjsm0601;
        let ahae0618Name = serviceHistoryList[j].ahae0618Name;  // 服务项目
        let ahae0621Name = serviceHistoryList[j].ahae0621Name;  // 服务内容
        let jjsm0604 = serviceHistoryList[j].jjsm0604;          // 服务日期？

        dlQueue.add(async ()=>{
          // 2.2 查询服务详情
          const serviceInfoResp = await jujiaServiceInfoDetails(jjsm0601)
          // console.log(resp2.data);

          // 2.3 下载现场照片
          let dlPath = `${areaCodeName}/${idCard}/${jjsm0604.substring(0, 10)}_第${idx}次服务_${ahae0618Name}`;
          // console.log(dlPath);
          await downloadFileByServiceInfo(serviceInfoResp.data.data, dlPath)
          logger.info(`第${i+1}个服务对象(${idCard})，第${idx}次服务-> 下载任务已创建`);
        })
      }
      // fsws.write(record +",done\n")
    })
  }
}


/*******************************************************  居家上门-服务二维码导出  *****************************************************************/


/**
 * 居家上门-服务二维码导出
 */
export async function jjServiceQrCodeExport( page=1, size=1, total=null, file=null, output=".", year=2025, areaCode){
  console.log("居家上门-服务二维码导出")
  let serviceObjIdcardList = [];

  // 1. 确定名单是从文件读取还是自己查询
  if(file==null){
    // 1.1. 通过接口获取服务对象列表
    console.log("未指定文件，直接从接口查询名单")

    let serviceObjListResp = await jujiaVisitServiceQuery(areaCode, null, null, size, page, year);
    let serviceObjList = serviceObjListResp.data.data.records;
    // logger.info("居家上门-综合查询-服务对象列表: ", serviceObjList)
    for(let i=0; i<serviceObjList.length; i++){
      const idCard = serviceObjList[i].ahbx1503;
      serviceObjIdcardList.push(idCard);
    }
  }else{
    // 1.2. 通过文件读取服务对象列表
    console.log("指定文件，直接从文件获取名单")

    const data = fs.readFileSync(file, 'utf8');
    let serviceObjList = data.split('\n');
    // logger.info("居家上门-综合查询-服务对象列表: ", serviceObjList)
    for(let i=0; i<serviceObjList.length; i++){
      const line = serviceObjList[i];
      const arr = line.split(",");
      const idCard =arr[0].trim();
      serviceObjIdcardList.push(idCard);
    }
  }
  logger.info("居家上门-综合查询-服务对象列表: ", serviceObjIdcardList)

  // 2. 创建导出任务
  for(let i=0; i<serviceObjIdcardList.length; i++){
    let idCard = serviceObjIdcardList[i];
    logger.info('处理idCard->' +  idCard);

    let ahbx1503 = idCard;

    queue.add(async () => {
      const response = await jujiaServiceQrCodeExport(ahbx1503)
      // let fileName =  (size*(page-1) + i+1) + ".（" + ahbx1502 +"）扫码评价二维码.pdf";
      let fileName =  (size*(page-1) + i+1) + "." + "" + "" + ahbx1503 +"-扫码评价二维码.pdf";
      let fullPath = output + "\\" + fileName;

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


/*******************************************************  居家上门-服务历史导出  *****************************************************************/


/**
 * 居家上门-服务历史导出
 */
export async function jjAutoJujiaServiceHistoryExport(page, size=1, total, file, output=".", year=2025, areaCode){

  // 1. 获取已确认费用列表 ， 1 是已确认
  let feeListResp = await jujiaVisitServiceQuery(areaCode, null, null, size, page, year);
  let feeList = feeListResp.data.data.records;
  
  logger.info("居家上门-综合查询-服务列表: ", feeList.length)

  
  // 2. 自动导出
  for(let i=0; i<feeList.length; i++){
    let ahbx1501 = feeList[i].ahbx1501;
    let ahbx1502 = feeList[i].ahbx1502;

    queue.add(async () => {
      const response = await jujiaServiceHistoryExport(ahbx1501, year)
      let fileName =  (size*(page-1) + i+1) + ".（" + ahbx1502 +"）居家养老上门服务历史表.xlsx";
      let fullPath = output + "\\" + fileName;

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




