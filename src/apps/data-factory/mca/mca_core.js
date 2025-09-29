#!/usr/bin/env node
// import fs from 'fs';
// import PQueue from 'p-queue';
// import { writeFileWithBOM } from '../../../common/file.js';
// import  { logger } from '../../../common/logger.js';
import request from './request.js';


/*****************************************  通用接口  ****************************************** */

/**
 * 
 * 查询行政区划信息
 * 
 */
export async function queryAreaInfo(code='654023103000'){
  let url = '/ylapi/console/area/getFullAreaByCode/' + code;
  return request.get(url);
}

/**
 * 
 * 查询项目详情
 * 
 */
export async function queryPrjInfo(year=2025){
  let url = '/ylapi/ylpt/v24ProjectInfo/applyDetail';

  let params = {
    year: year,
  }

  return request.post(url, null, {params: params});
}


/*****************************************  居家养老上门服务  ****************************************** */


/**
 * 
 * 居家养老上门服务-根据行政区划code查询服务机构信息
 * 
 */
export async function jujiaOrgList(ahae0621='01', areaCode='654023103000'){
  let url = '/ylapi/ylpt/v24Visitingservice/queryHae1InfoList';

  let params = {
    ahae0621: ahae0621,
    areaCode: areaCode,
  }

  return request.post(url, null, {params: params});
}


/**
 * 
 * 居家养老上门服务-申请-获取列表
 * 
 */
export async function jujiaApplyList(size=1){
  let url = '/ylapi/ylpt/v24Visitingservice/homeVisitServiceFillApplyList';

  let params = {
    current: 1,
    size: size,
    year: 2025,
  }

  return request.post(url, null, {params: params});
}


/**
 * 
 * 居家养老上门服务-申请-获取详情
 * 
 */
export async function jujiaApplyDetail(ahbx1501='84b14778a93e4a71996e784342bc81ba', jjsm0201='00CC67273E6B469CBE79ADF695977D24'){
  let url = '/ylapi/ylpt/v24Visitingservice/details';

  let params = {
    ahbx1501: ahbx1501,
    jjsm0201: jjsm0201,
  }

  return request.get(url, {params: params});
}


/**
 * 
 * 居家养老上门服务-申请-暂存申请
 * 
 */
export async function jujiaApplySave(jujiaApplyParam){
  let url = '/ylapi/ylpt/v25Visitingservice/v25homeVisitServiceApplyTemp';

  return request.post(url, jujiaApplyParam);
}


/**
 * 
 * 居家养老上门服务-申请-提交申请
 * 
 */
export async function jujiaApplySubmit(jujiaApplyParam){
  let url = '/ylapi/ylpt/v25Visitingservice/v25homeVisitServiceApply';

  return request.post(url, jujiaApplyParam);
}


/**
 * 
 * 居家养老上门服务-初步审核-获取审核列表
 * 
 */
export async function jujiaAuditList(size=1){
  let url = '/ylapi/ylpt/v24Visitingservice/homeVisitServiceInitAuditList';

  let params = {
    current: 1,
    size: size,
    year: 2025,
  }

  return request.post(url, null, {params: params});
}



/**
 * 
 * 居家养老上门服务-初步审核-审核提交
 * 
 */
export async function jujiaAuditApprove(jujiaApproveParam){
  let url = '/ylapi/ylpt/v24Visitingservice/homeVisitServiceInitAudit';

  return request.put(url, jujiaApproveParam);
}


/**
 * 
 * 居家养老上门服务-审核-列表-【区县账号】
 * 
 */
export async function jujiaGovAuditList(size=1){
  let url = '/ylapi/ylpt/v24Visitingservice/homeVisitServiceTodoAuditList';

  let params = {
    current: 1,
    size: size,
    year: 2025,
  }

  return request.post(url, null, {params: params});
}


/**
 * 
 * 居家养老上门服务-审核-【区县账号】
 * 
 */
export async function jujiaGovAuditApprove(jujiaApproveParam){
  let url = '/ylapi/ylpt/v24Visitingservice/homeVisitServiceAudit';
             
  return request.put(url, jujiaApproveParam);
}




/*****************************************  家庭养老床位建设  ****************************************** */


/**
 * 
 * 家庭养老床位建设-根据行政区划code查询服务机构信息
 * 
 * ahbx1701   1 评估设计机构， 2 服务机构， 3 验收机构
 * 
 * 例如 areaCode='360428100000' ， 地区code不一样，数据可能不同，千万别错！
 * 
 */
export async function homeBedOrgList(ahbx1701, areaCode){
  let url = '/ylapi/ylpt/v24ConstructionBed/queryHae1InfoList';

  let params = {
    ahbx1701: ahbx1701,
    areaCode: areaCode,
  }

  return request.post(url, null, {params: params});
}


/**
 * 
 * 家庭养老床位建设-申请-获取列表
 * 
 */
export async function homeBedApplyList(size=1){
  let url = '/ylapi/ylpt/v24ConstructionBed/bedBuildFillApplyList';

  let params = {
    current: 1,
    size: size,
    year: 2025,
  }

  return request.post(url, null, {params: params});
}

/**
 * 
 * 家庭养老床位建设-申请-详情
 * 
 */
export async function homeBedApplyDetail(ahbx1501='bd96bb077d3a4da6a5d47a6489c4e4ed', ahbx1601='9090ED612FD64169B2939A74B4392349'){
  let url = '/ylapi/ylpt/v24ConstructionBed/details';

  let params = {
    ahbx1501: ahbx1501,
    ahbx1601: ahbx1601,
  }

  return request.get(url, {params: params});
}


/**
 * 
 * 家庭养老床位建设-申请-暂存申请
 * 
 */
export async function homeBedApplySave(homeBedApplyParam){
  let url = '/ylapi/ylpt/v25ConstructionBed/v25bedBuildApplyTemp';

  return request.post(url, homeBedApplyParam);
}


/**
 * 
 * 家庭养老床位建设-申请-提交申请
 * 
 */
export async function homeBedApplySubmit(homeBedApplyParam){
  let url = '/ylapi/ylpt/v25ConstructionBed/v25bedBuildApply';

  return request.post(url, homeBedApplyParam);
}


/**
 * 
 * 家庭养老床位建设-初步审核-获取审核列表
 * 
 */
export async function homeBedAuditList(size=1){
  let url = '/ylapi/ylpt/v24ConstructionBed/bedBuildFillInitAuditList';

  let params = {
    current: 1,
    size: size,
    year: 2025,
  }

  return request.post(url, null, {params: params});
}


/**
 * 
 * 家庭养老床位建设-初步审核-审核申请
 * 
 */
export async function homeBedAuditApprove(homebedApproveParam){
  let url = '/ylapi/ylpt/v24ConstructionBed/bedBuildInitAudit';

  return request.post(url, homebedApproveParam);
}


/**
 * 
 * 家庭养老床位建设-审核-列表-【区县账号】
 * 
 */
export async function homebedGovAuditList(size=1){
  let url = '/ylapi/ylpt/v24ConstructionBed/bedBuildCountyTodoAuditList';

  let params = {
    current: 1,
    size: size,
    year: 2025,
  }

  return request.post(url, null, {params: params});
}


/**
 * 
 * 家庭养老床位建设-完成-列表-【区县账号】
 * 
 */
export async function homebedGovCompleteList(size=1){
  let url = '/ylapi/ylpt/v24ConstructionBed/bedBuildCountyCompleteAuditList';

  let params = {
    current: 1,
    size: size,
    year: 2025,
  }

  return request.post(url, null, {params: params});
}


/**
 * 
 * 家庭养老床位建设-审核-【区县账号】
 * 
 */
export async function homebedGovAuditApprove(jujiaApproveParam){
  let url = '/ylapi/ylpt/v24ConstructionBed/bedBuildCountyAudit';
             
  return request.post(url, jujiaApproveParam);
}


