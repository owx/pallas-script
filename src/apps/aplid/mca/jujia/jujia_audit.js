#!/usr/bin/env node
import PQueue from 'p-queue';
import  { logger } from '#utils/logger.js';
import {
  queryUserInfo,
  queryPrjInfo,
  jujiaOrgList,
  jujiaApplyDetail,
  jujiaAuditList,
  jujiaAuditApprove,
  jujiaGovAuditList,
  jujiaGovAuditApprove,
} from "../core/mca_core.js";

/**
 * 街道账号，自动审批
 */
export async function jjJiedaoAutoAudit(name, size=1, jobTitle="工作人员"){

  // 1. 获取用户登录信息（主要是获取用户登录姓名）
  let uesrInfoResp = await queryUserInfo()
  let uesrInfo = uesrInfoResp.data.data;
  let userName = uesrInfo.sysUser.name;
  // logger.info("获取用户登录信息:", uesrInfo)
  logger.info("获取用户姓名:", userName)
  if( !userName ){
    logger.info("获取用户姓名失败！")
    return;
  }
  if( userName!=name){
    logger.info("审批人和当前账号不是同一人！")
    return;
  }

  // 2. 获取当前项目信息（认定标准）
  let prjInfoResp = await queryPrjInfo()
  let prjInfo = prjInfoResp.data.data;
  let ahbx1401 = prjInfo.ahbx1401;  // code
  let ahbx1402 = prjInfo.ahbx1402;  // 城市低收入老年人认定标准
  let ahbx1411 = prjInfo.ahbx1411;  // 农村低收入老年人认定标准
  // logger.info("查询项目信息:", prjInfo)

  // 3. 获取审核列表
  let auditListResp = await jujiaAuditList(size);
  let auditList = auditListResp.data.data.records;
  // logger.info("获取审核列表", auditList);
  

  // 4. 自动审核
  const queue = new PQueue({ concurrency: 1 });
  for(let i=0; i<auditList.length; i++){

    let apply = auditList[i];
    let jjsm0201 = apply.jjsm0201;
    let ahbx1501 = apply.ahbx1501;

    queue.add(async () => {
      let auditDetailResp = await jujiaApplyDetail(ahbx1501, jjsm0201);
      let auditDetail = auditDetailResp.data.data;
      
      let jujiaApproveParam = {
        jjsm0201: auditDetail.jjsm0201,
        ahbx1501: auditDetail.hbx15Dto.ahbx1501,
        jjsm04DtoList: auditDetail.jjsm04VoList,
        jjsmCsInfoDto: {
          ahbx1402: ahbx1402,
          ahbx1411: ahbx1411,
          jjsm0205: "1",
          jjsm0203: name,
          jjsm0204: jobTitle,
          jjsm0206: ""
        }
      }

      // console.log(jujiaApproveParam)
      await jujiaAuditApprove(jujiaApproveParam).then((resp)=>{
        console.log(resp.data)
      })

    });

  }

}


/**
 * 区账号，自动审批
 */
export async function jjQuxianAutoAudit(name, jobTitle="主任"){

  // 1. 获取用户登录信息（主要是获取用户登录姓名）
  let uesrInfoResp = await queryUserInfo()
  let uesrInfo = uesrInfoResp.data.data;
  let userName = uesrInfo.sysUser.name;
  // logger.info("获取用户登录信息:", uesrInfo)
  logger.info("获取用户姓名:", userName)
  if( !userName ){
    logger.info("获取用户姓名失败！")
    return;
  }
  if( userName!=name){
    logger.info("审批人和当前账号不是同一人！")
    return;
  }
  
  // 2. 查询申请列表
  let auditListResp = await jujiaGovAuditList(50);
  let auditList = auditListResp.data.data.records;

  // console.log(auditList);

  // 3. 自动审核
  const queue = new PQueue({ concurrency: 1 });
  for(let i=0; i<auditList.length; i++){

    let apply = auditList[i];
    let jjsm0201 = apply.jjsm0201;
    let ahbx1501 = apply.ahbx1501;

    queue.add(async () => {
      let auditDetailResp = await queryJujiaAuditDetail(ahbx1501, jjsm0201);
      let auditDetail = auditDetailResp.data.data;
      // console.log(auditDetail);

      let approveParam = {
        jjsm0201: auditDetail.jjsm0201,
        ahbx1501: auditDetail.hbx15Dto.ahbx1501,
        jjsm04DtoList: auditDetail.jjsm04VoList,
        jjsmShInfoDto: {
          axbe0001: "00000000000000000000000000000000",
          ahbx1402: 980,
          ahbx1411: 765,
          jjsm0209: "1",
          jjsm0207: name,
          jjsm0208: jobTitle,
          jjsm0210: ""
        },
        year:"2025"
      }

      // console.log(approveParam)
      await jujiaGovAuditApprove(approveParam).then((resp)=>{
        console.log(resp.data)
      })


    });

  }

}

