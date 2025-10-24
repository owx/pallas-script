#!/usr/bin/env node
import PQueue from 'p-queue';
import  { logger } from '../../../../common/logger.js';
import {
  queryPrjInfo,
  homeBedOrgList,
  homeBedApplyDetail,
  homeBedAuditList,
  homeBedAuditApprove,
  homebedGovAuditList,
  homebedGovAuditApprove,
  homebedGovCompleteList
} from "../mca_core.js";


/**
 * 街道账号，自动审批
 */
export async function jiedaoAutoAudit(name, size=1, jobTitle="工作人员"){

  // 1. 获取当前项目信息（认定标准）
  let prjInfoResp = await queryPrjInfo()
  let prjInfo = prjInfoResp.data.data;
  let ahbx1401 = prjInfo.ahbx1401;  // code
  let ahbx1402 = prjInfo.ahbx1402;  // 城市低收入老年人认定标准
  let ahbx1411 = prjInfo.ahbx1411;  // 农村低收入老年人认定标准
  logger.info("查询项目信息(认定标准)")

  // 2. 获取审核列表
  let auditListResp = await homeBedAuditList(size);
  let auditList = auditListResp.data.data.records;
  logger.info("获取审核列表-> " , auditList.length);
  

  // 2. 自动审核
  const queue = new PQueue({ concurrency: 1 });
  for(let i=0; i<auditList.length; i++){
    let apply = auditList[i];

    let ahbx1501 = apply.ahbx1501;
    let ahbx1601 = apply.ahbx1601;

    queue.add(async () => {
      let auditDetailResp = await homeBedApplyDetail(ahbx1501, ahbx1601);
      let auditDetail = auditDetailResp.data.data;

      let approveParam = {
        ahbx1601: auditDetail.ahbx1601,
        cauditInfo: {
          ahbx1402: ahbx1402,
          ahbx1411: ahbx1411,
          ahbx1603: 1,
          ahbx1602: name,
          ahbx1605: jobTitle,
          ahbx1604: ""
        }
      }

      // console.log(approveParam);
      await homeBedAuditApprove(approveParam).then((resp)=>{
        console.log(resp.data)
      })

    });

  }

}


/**
 * 
 * 区账号，自动审批
 * 
 */
export async function quxianAutoAudit(areaCode, name="", size=1, jobTitle="主任"){

  // 1. 获取当前项目信息（认定标准）
  let prjInfoResp = await queryPrjInfo()
  let prjInfo = prjInfoResp.data.data;
  let ahbx1401 = prjInfo.ahbx1401;  // code
  let ahbx1402 = prjInfo.ahbx1402;  // 城市低收入老年人认定标准
  let ahbx1411 = prjInfo.ahbx1411;  // 农村低收入老年人认定标准
  logger.info("查询项目信息(认定标准)")


  // 2. 获取评估设计机构信息
  let pgOrgListResp = await homeBedOrgList(1, areaCode);
  let pgOrgList = pgOrgListResp.data.data;
  if((!pgOrgList) || pgOrgList.length>1 || pgOrgList.length==0){
    logger.error("获取到的评估设计机构超过一个，需要先确定一下使用哪个！")
    return;
  }
  let pgAxbe0001 = pgOrgList[0].axbe0001; //机构代号
  let pgAxbe0003 = pgOrgList[0].axbe0003; //机构名称
  logger.info("获取评估设计机构信息: " + pgAxbe0003)


  // 3. 获取验收机构信息
  let ysrOgListResp = await homeBedOrgList(3, areaCode);
  let ysrOgList = ysrOgListResp.data.data;
  if((!ysrOgList) || ysrOgList.length>1 || ysrOgList.length==0){
    logger.error("获取到的验收机构超过一个，需要先确定一下使用哪个！")
    return;
  }
  let ysAxbe0001 = ysrOgList[0].axbe0001; //机构代号
  let ysAxbe0003 = ysrOgList[0].axbe0003; //机构名称
  logger.info("获取验收机构信息: " + ysAxbe0003)


  // 4. 获取审核列表
  let auditListResp = await homebedGovAuditList(size);
  let auditList = auditListResp.data.data.records;
  logger.info("获取审核列表-> " , auditList.length);
  

  // 4. 获取完成列表（用来驳回审核，重新填报数据的）
  // let auditListResp = await homebedGovCompleteList(size);
  // let auditList = auditListResp.data.data.records;
  // logger.info("获取审核列表-> " , auditList);
  

  // 5. 自动审核
  const queue = new PQueue({ concurrency: 1 });
  for(let i=0; i<auditList.length; i++){
    let apply = auditList[i];

    let ahbx1501 = apply.ahbx1501;
    let ahbx1601 = apply.ahbx1601;

    queue.add(async () => {
      let auditDetailResp = await homeBedApplyDetail(ahbx1501, ahbx1601);
      let auditDetail = auditDetailResp.data.data;

      let approveParam = {
        ahbx1601: auditDetail.ahbx1601,
        year:  "2025",
        pgAxbe0001: pgAxbe0001,
        ysAxbe0001: ysAxbe0001,
        zauditInfo: {
          pgAxbe0001: pgAxbe0001,
          ysAxbe0001: ysAxbe0001,
          ahbx1402: ahbx1402,
          ahbx1411: ahbx1411,
          ahbx1607: 1,              // 审核状态， 0 不通过， 1 通过
          ahbx1606: name,
          ahbx1609: jobTitle,
          ahbx1608: ""
        }
      }

      console.log(approveParam);
      await homebedGovAuditApprove(approveParam).then((resp)=>{
        console.log(resp.data)
      })

    });

  }

}

