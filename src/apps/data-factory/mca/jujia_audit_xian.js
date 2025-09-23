#!/usr/bin/env node
import fs from 'fs';
import axios from './axios.js';
import { writeFileWithBOM } from '../../common/file.js';
import  { logger } from '../../common/logger.js';
import PQueue from 'p-queue';
import { jujiaSaveParam } from './data/jjParams.js'; 


/**
 * 
 * 查询居家养老上门服务-审核-列表
 * edFlag 似乎是用来判断是否已编辑完， 0 已完成， 1未完成
 * 
 */
function queryJujiaAuditList(size=1){
  let url = 'https://ylfw.mca.gov.cn/ylapi/ylpt/v24Visitingservice/homeVisitServiceTodoAuditList';

  let params = {
    current: 1,
    size: size,
    year: 2025,
  }

  return axios.post(url, null, {params: params});
}

/**
 * 
 * 查询居家养老上门服务-审核-查看详情
 * 
 */
function queryJujiaAuditDetail(ahbx1501, jjsm0201){
  let url = 'https://ylfw.mca.gov.cn/ylapi/ylpt/v24Visitingservice/details';

  let params = {
    ahbx1501: ahbx1501,
    jjsm0201: jjsm0201,
  }

  return axios.get(url, {params: params});
}
/**
 * 
 * 查询居家养老上门服务-审核（通过）
 * 
 */
function approveJujiaAudit(jujiaApproveParam){
  let url = 'https://ylfw.mca.gov.cn/ylapi/ylpt/v24Visitingservice/homeVisitServiceAudit';
             
  return axios.put(url, jujiaApproveParam);
}


/**
 * 主入口，自动化处理
 */
export async function autoAudit(name, jobTitle="主任"){
  // 1. 查询申请列表
  let auditListResp = await queryJujiaAuditList(50);
  let auditList = auditListResp.data.data.records;

  // console.log(auditList);

  // 2. 自动审核
  const queue = new PQueue({ concurrency: 1 });
  for(let i=0; i<auditList.length; i++){

    let apply = auditList[i];
    let jjsm0201 = apply.jjsm0201;
    let ahbx1501 = apply.ahbx1501;

    queue.add(async () => {
      let auditDetailResp = await queryJujiaAuditDetail(ahbx1501, jjsm0201);
      let auditDetail = auditDetailResp.data.data;
      // console.log(auditDetail);

      let jujiaApproveParam = {
        "jjsm0201": auditDetail.jjsm0201,
        "ahbx1501": auditDetail.hbx15Dto.ahbx1501,
        "jjsm04DtoList": auditDetail.jjsm04VoList,
        "jjsmShInfoDto": {
          "axbe0001": "00000000000000000000000000000000",
          "ahbx1402": 980,
          "ahbx1411": 765,
          "jjsm0209": "1",
          "jjsm0207": "余强强",
          "jjsm0208": "主任",
          "jjsm0210": ""
        },
        "year":"2025"
      }

      // console.log(jujiaApproveParam)

      await approveJujiaAudit(jujiaApproveParam).then((resp)=>{
        console.log(resp.data)
      })


    });

  }

}




