#!/usr/bin/env node
import PQueue from 'p-queue';
import  { logger } from '#utils/logger.js';
import {
  homeBedAcceptanceList,
  replaceYSInstitutionAllocate,
} from "../core/mca_core.js";


/**
 * 主入口，自动化处理
 */
export async function hbAutoChangeOrg(areaCode, limit=300){

  // // 1. 获取验收机构变更列表
  let acceptanceListResp = await homeBedAcceptanceList(limit)
  let acceptanceList = acceptanceListResp.data.data.records;
  // let ahbx1401 = prjInfo.ahbx1401;  // code
  // let ahbx1402 = prjInfo.ahbx1402;  // 城市低收入老年人认定标准
  // let ahbx1411 = prjInfo.ahbx1411;  // 农村低收入老年人认定标准
  logger.info("获取验收机构变更列表大小:", acceptanceList.length)


  // // 2. 获取验收机构列表
  // let orgListResp = await homeBedOrgList(2, areaCode)
  // let orgList = orgListResp.data.data;
  // if((!orgList) || orgList.length>1 || orgList.length==0){
  //   logger.error("获取到的服务组织超过一个，需要先确定一下使用哪个！", orgList)
  //   return;
  // }
  // let axbe0001 = orgList[0].axbe0001; //机构代号
  // let axbe0003 = orgList[0].axbe0003; //机构名称
  let ysAxbe0001="9bbb399e326c60fa3a62224d7e59fce6"
  logger.info("验收机构:" + ysAxbe0001);


  // 3. 自动提交
  const queue = new PQueue({
    concurrency: 1,
    interval: 1,
    intervalCap: 1,
  });
  for(let i=0; i<acceptanceList.length; i++){
    let acceptance = acceptanceList[i];
    logger.info("服务对象->" + acceptance.ahbx1502)

    // 生成提交参数
    let ahbx1601 = acceptance.ahbx1601;

    queue.add(async () => 
      await replaceYSInstitutionAllocate(ahbx1601, ysAxbe0001).then(resp => {
        logger.info(resp.data)
      }).catch(error => {
            console.error('Error:', error);
      })
    );

  }
}
