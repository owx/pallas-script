#!/usr/bin/env node
import PQueue from 'p-queue';
import  { logger } from '../../../../common/logger.js';
import { writeFileWithBOM } from '../../../../common/file.js';

import {
  jujiaAllocList,
} from "../mca_core.js";


/**
 * 
 * @param {*} path 存储文件路径
 * @param {*} size 获取分页数据大小
 */
export async function autoAllocStatistic(path, size=1){

  // 1. 获取服务人员列表
  let allocListResp = await jujiaAllocList(2, size);
  let allocList = allocListResp.data.data.records;
  
  // logger.info("居家上门-已分派列表", allocList)
  let content = "";

  for(let i=0; i<allocList.length; i++){
    let line = allocList[i].ahbx1502 + "," + allocList[i].ahbx1503 + "," + allocList[i].ahbx1511 + "," + allocList[i].ahdx6124Name;
    content += (line +'\n');
    logger.info(line)
  }

  writeFileWithBOM(path, content);

}




