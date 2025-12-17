#!/usr/bin/env node
import fs from 'fs';
import PQueue from 'p-queue';
import  { logger } from '#utils/logger.js';
import {
  homebedAllocList,
  homebedEmployeeList,
  homebedAllocSubmit,
} from "../core/mca_core.js";


/**
 * 主入口，自动化处理
 */
export async function hbAutoSubmitAlloc(servicerName="", size=1){

  // 1. 获取服务人员列表
  let servicerListResp = await homebedEmployeeList()
  let servicerList = servicerListResp.data.data;
  let allocServicerList = servicerList.filter((servicer)=> servicer.ahdx6125 === servicerName)
  if((!allocServicerList) || allocServicerList.length>1 || allocServicerList.length==0){
    logger.error("没有服务员或者同名服务员过多，请检查数据是否正确！", allocServicerList)
    return;
  }
  let axbe0001 = allocServicerList[0].axbe0001;
  let ahdx6124 = allocServicerList[0].ahdx6124;
  let ahdx6125 = allocServicerList[0].ahdx6125;
  logger.info("服务员信息：" + ahdx6125)


  // 2. 获取待分配列表
  let allocListResp = await homebedAllocList(size);
  let allocList = allocListResp.data.data.records;
  logger.info("获取待分配列表: ", allocList.length)

  // 3. 自动分配
  const queue = new PQueue({ concurrency: 1 });
  for(let i=0; i<allocList.length; i++){
    let task = allocList[i];

    // 生成提交参数
    let ahbx1601 = task.ahbx1601;
    let ahbx1701 = task.ahbx1701;

    let param = {
      ahbx1601: ahbx1601,     // 服务对象ID
      ahbx1701: ahbx1701,     // 分配类型？
      ahdx6124: ahdx6124,     // 服务员ID
      axbe0001: axbe0001,     // 服务员所在组织id？
      year: 2025
    }

    // console.log(param)
    queue.add(async () => 
      await homebedAllocSubmit(param).then(resp => {
        logger.info(resp.data)
      }).catch(error => {
            console.error('Error:', error);
      })
    );

  }
}

/**
 * 通过文件进行分配, 文件中指定需要分配的对象姓名和身份证号以及服务员的姓名
 * 
 */
export async function hbAutoAllocByFile(allocFile, startLine=0, thread=1){
    const queue = new PQueue({ concurrency: thread });

    // 1. 获取服务人员列表
    let servicerListResp = await homebedEmployeeList()
    let servicerList = servicerListResp.data.data;
    // logger.info("服务员列表：", servicerList)


    // 2. 读取文件获取需要分配的人员列表
    const data = fs.readFileSync(allocFile, 'utf8');
    let list = data.split('\n');

    // 3. 按行进行处理需要分配的人员
    for(let i=startLine; i<list.length; i++){
      logger.error(i + ',' +  list[i]);

      let arr = list[i].split(',');
      let srvObjName =arr[0].trim();
      let srvObjIdCard =arr[1].trim();
      let servicerName =arr[2].trim();

      // logger.error('srvObjName:' +  srvObjName);
      // logger.error('srvObjIdCard:' +  srvObjIdCard);
      // logger.error('servicerName:' +  servicerName);
      
      let ahbx1503 = srvObjIdCard;
      queue.add(async () => {
        let allocListResp = await homebedAllocList(1, 1, 2025, ahbx1503)
        let allocList = allocListResp.data.data.records;
        // logger.info("获取待分配列表: ", allocList)

        if(allocList.length !== 1){
          logger.info(srvObjName + '->' + servicerName + ": 未查到该服务对象,或服务对象有多个")
          return;
        }

        let allocServicerList = servicerList.filter((servicer)=> servicer.ahdx6125 === servicerName)
        if(allocServicerList.length !== 1){
          logger.info(srvObjName + '->' + servicerName + ": 未找到需要分配的服务员")
          return;
        }
  
        let axbe0001 = allocServicerList[0].axbe0001;
        let ahdx6124 = allocServicerList[0].ahdx6124;
        let ahdx6125 = allocServicerList[0].ahdx6125;

        // 生成提交参数
        let ahbx1601 = allocList[0].ahbx1601;
        let ahbx1701 = allocList[0].ahbx1701;

        let param = {
          ahbx1601: ahbx1601,     // 服务对象ID
          ahbx1701: ahbx1701,     // 分配类型？
          ahdx6124: ahdx6124,     // 服务员ID
          axbe0001: axbe0001,     // 服务员所在组织id？
          year: 2025
        }

        await homebedAllocSubmit(param).then(resp => {
          logger.info(srvObjName + '->' + servicerName + ": 分配成功")
          // logger.info(resp.data)
        }).catch(error => {
          logger.error(srvObjName + '->' + servicerName + ": 分配失败")
              // console.error('Error:', error);
        })

      });
    }
}



