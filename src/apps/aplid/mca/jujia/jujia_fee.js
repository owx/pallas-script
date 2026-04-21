#!/usr/bin/env node
import PQueue from 'p-queue';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

import {
  jujiaFeeConfirmList,
  jujiaFeeConfirm,
  jujiaFeeHistoryList,
  jujiaFeeHistoryExport
} from "../core/mca_core.js";
import Logger from '#src/utils/LoggerUtils.js'

const logger = new Logger({ layout: {type: 'pattern', pattern: '%m'} });

// 创建任务队列
const queue = new PQueue({ 
  intervalCap: 1,   // 每个时间窗口内最多执行的任务数
  interval: 2000,   // 时间窗口长度（毫秒）
  concurrency: 1     // 并发数（可选，默认 Infinity）
});


/**
 * 居家养老上门服务-服务费用确认-未确认费用确认
 */

// export async function jjFeeAutoConfirmAll(size=1) {
//   const queue = new PQueue({
//     // intervalCap: 1,   // 每个时间窗口内最多执行的任务数
//     // interval: 2000,   // 时间窗口长度（毫秒）
//     concurrency: 1     // 并发数（可选，默认 Infinity）
//   });
//   logger.info("居家养老上门服务-服务费用确认-总数: ", size)

//   let pageSize = 500;
//   let currentPage = 1;
//   let total = size/pageSize;

//   for(let i=Math.ceil(total); i>0; i--){
//     queue.add(async () => {
//       console.log("task->" + i);
//       await jjAutoJujiaFeeConfirm(i, pageSize)
//     })
//   }
// }

export async function jjAutoJujiaFeeConfirm(current=1, size=1, total=1){
  
  // 1. 获取已确认费用列表 ， 1 是已确认
  let confirmList=[];
  let totalPage=Math.ceil(total/size);
  for(let i=current; i<=totalPage; i++){
    let confirmListResp = await jujiaFeeConfirmList(0, size, i);
    let list = confirmListResp.data.data?.records;
    
    if(list==null){
      logger.info(`居家养老上门服务-服务费用确认-当前页面码：${totalPage} / ${i}, 分页大小：${size} -> 数据异常退出`)
      return;
    }else{
      logger.info(`居家养老上门服务-服务费用确认-当前页面码：${totalPage} / ${i}, 分页大小：${size}, 实际数量: ${list.length}`)
    }
    confirmList.push(...list);
  }

  await jjAutoConfirm(confirmList);
}


/**
 * 居家养老上门服务-服务费用确认-确认费用
 * @param {*} confirmList 
 */
async function jjAutoConfirm(confirmList=[]){

  // 1. 已确认费用列表
  logger.info("已确认列表: ", confirmList)

  const targetDate = new Date('2026-04-01');

  for(let i=0; i<confirmList.length; i++){
    let ahbx1502 = confirmList[i].ahbx1502;           // 服务对象姓名

    // 判断服务日期是否再要求时间之前
    let jjsm0619 = confirmList[i].jjsm0619;           // 服务日期
    let serviceDate = new Date(jjsm0619);
    let needConfirm = serviceDate < targetDate;
    if(!needConfirm){
      console.log(ahbx1502 + "->服务日期->" + jjsm0619 + " -> 暂不确认");
      continue;
    }

    // 服务员黑名单
    let ahdx6124Name = confirmList[i].ahdx6124Name;   // 服务员姓名
    const blackNameList = ["慕利敏", "哈夫再", "王保从", "来孜娜·依布拉音", "尼汗热衣·艾尼瓦尔"];
    if( blackNameList.includes(ahdx6124Name)){
      console.log(ahbx1502 + "->服务黑名单->" + ahdx6124Name + " -> 暂不确认");
      continue;
    }

    // 获取确认参数
    let jjsm0601 = confirmList[i].jjsm0601;
    let ahbx1501 = confirmList[i].ahbx1501;
    let jjsm0603 = confirmList[i].jjsm0603;
    let jjsm0625 = confirmList[i].jjsm0625;
    let jjsm0609 = confirmList[i].jjsm0609;
    
    queue.add(async () => {
      // console.log(ahbx1502 + "->服务日期->" + jjsm0619 + " -> 正在确认");
      const response = await jujiaFeeConfirm(jjsm0601, ahbx1501, jjsm0603, jjsm0625, jjsm0609)
      console.log(i + '->' + JSON.stringify(response.data) );
    })
  }
}


/**
 * 居家养老上门服务-服务费用确认-历史费用导出
 */
const streamPipeline = promisify(pipeline);
export async function jjAutoJujiaFeeHistoryExport(filePath=".", size=1){

  // 1. 获取已确认费用列表 ， 1 是已确认
  let feeListResp = await jujiaFeeConfirmList(1, size);
  let feeList = feeListResp.data.data.records;
  
  logger.info("居家上门-服务费用确认-已确认列表: ", feeList.length)

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
