#!/usr/bin/env node
import fs from 'fs';
import axios from './axios.js';
import { writeFileWithBOM } from '../../../common/file.js';
import  { logger } from '../../../common/logger.js';
import PQueue from 'p-queue';
import { jujiaSaveParam } from './data/jjParams.js'; 



/**
 * 
 * 查询居家养老上门服务-申请-列表
 * edFlag 似乎是用来判断是否已编辑完， 0 已完成， 1未完成
 * 
 */
function queryJujiaApplyList(size=1){
  let url = 'https://ylfw.mca.gov.cn/ylapi/ylpt/v24Visitingservice/homeVisitServiceFillApplyList';

  let params = {
    current: 1,
    size: size,
    year: 2025,
  }

  return axios.post(url, null, {params: params});
}

/**
 * 
 * 查询居家养老上门服务-申请-保存服务项目
 * 
 */
function saveJujiaApply(jujiaSaveParam){
  let url = 'https://ylfw.mca.gov.cn/ylapi/ylpt/v25Visitingservice/v25homeVisitServiceApplyTemp';

  return axios.post(url, jujiaSaveParam);
}

/**
 * 
 * 查询居家养老上门服务-申请-保存服务项目
 * 
 */
function submitJujiaApply(jujiaSaveParam){
  let url = 'https://ylfw.mca.gov.cn/ylapi/ylpt/v25Visitingservice/v25homeVisitServiceApply';

  return axios.post(url, jujiaSaveParam);
}


/**
 * 
 * 查询居家养老上门服务-查询申请项目详情
 * 
 */
function queryApplyProjectDetail(){
  let url = 'https://ylfw.mca.gov.cn/ylapi/ylpt/v24ProjectInfo/applyDetail';

  let params = {
    year: 2025,
  }

  return axios.post(url, null, {params: params});
}

/**
 * 主入口，自动化处理
 */
export async function autoSubmitApply(){
  // 1. 查询申请列表
  let applyListResp = await queryJujiaApplyList(1);
  let applyList = applyListResp.data.data.records;
  // console.log(applyList);
  
  // 2. 查询项目详情
  let projectInfoResp = await queryApplyProjectDetail()
  let projectInfo = projectInfoResp.data.data;
  console.log(projectInfo)

  // 3. 自动提交
  const queue = new PQueue({ concurrency: 1 });
  for(let i=0; i<applyList.length; i++){
    let apply = applyList[i];

    // logger.info('分配任务 ' +  task.ahbx1502 + '( ' + task.ahbx1501 + ')  ==> ' + ahdx6125 + '(' + ahdx6124 + ')');

    let jjsm0201 = apply.jjsm0201;
    let ahbx1501 = apply.ahbx1501;
    let hbx15Dto = {
      ahbx1502:apply.ahbx1502,
      ahbx1503:apply.ahbx1503,
      ahbx1511:apply.ahbx1511,
      ahbx1508:apply.ahbx1508,
      ahbx1504:apply.ahbx1504,
      ahbx1402:apply.ahbx1402,
      ahbx1411:apply.ahbx1411,
      ahbx1505:apply.ahbx1505,
      ahbx1506:apply.ahbx1506,
      ahbx1501:apply.ahbx1501,
    }

    let param = {
      ...jujiaSaveParam,
      jjsm0201: jjsm0201,
      ahbx1501: ahbx1501,
      hbx15Dto: hbx15Dto,
    }

    // queue.add(async () => 
    //   await submitJujiaApply(param).then(resp => {
    //       console.log(resp.data)
    //         // logger.info('分配任务 (类型：'  + taskType  + ')' +  srvObjName + '( ' + task.ahbx1501 + ')  ==> ' + employeeName + '(' + employeeId + ')' + JSON.stringify(resp.data));
    //   }).catch(error => {
    //         console.error('Error:', error);
    //   })
    // );

  }

}




