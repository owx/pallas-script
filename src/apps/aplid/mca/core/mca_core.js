#!/usr/bin/env node
import { axiosManager } from '#utils/AxiosManager.js';


/**
 * 全国养老服务信息系统
 * https://ylfw.mca.gov.cn/
 */

// 全国养老服务信息系统
// 全国养老服务信息平台（管理端）
// 2025年提升行动项目
// 居家养老上门服务
// 街道申请，街道审批，县审批
// 

const authorization = 'Bearer 270f56ca-7b90-401c-87c0-063119a751a3';

const request = axiosManager.createInstance("mca", {
  baseURL: "https://ylfw.mca.gov.cn",
  timeout: 5000,
  headers: {
    authorization: authorization,
  }
})


/*****************************************  通用接口  ****************************************** */


/**
 * 
 * 查询当前账号用户信息
 * 
 */
export async function queryUserInfo(appId='ylpt'){
  let url = '/ylapi/console/dsrpt/user/info';

  let params = {
    appId: appId,
  }

  return request.get(url, {params: params});
}


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



/*******以下**********************************  居家养老上门服务  ****************************************** */

/**
 * 
 * 居家养老上门服务-根据行政区划code和服务类型查询服务项目的机构信息
 * （备注：默认居家的服务机构选择会通过传递参数 01 来查询可用的服务机构）
 * 
 * @param {*} areaCode 
 * @param {*} ahae0621 服务类型： 01 生活照料服务, 02 基础照顾服务, 03探访关爱服务, 04 健康管理服务, 05 委托代办服务, 06 精神慰藉服务
 * @returns 
 */
export async function jujiaOrgList(areaCode, ahae0621='01'){
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

  // let jujiaApplyParam = {
  //   jjsm0201: jjsm0201,
  //   ahbx1501: ahbx1501,
  //   hbx15Dto: hbx15Dto,
  //   jjsm04DtoList: jjsm04DtoList,
  // }

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

  // let jujiaApproveParam = {
  //   jjsm0201: auditDetail.jjsm0201,
  //   ahbx1501: auditDetail.hbx15Dto.ahbx1501,
  //   jjsm04DtoList: auditDetail.jjsm04VoList,
  //   jjsmCsInfoDto: {
  //     ahbx1402: ahbx1402,
  //     ahbx1411: ahbx1411,
  //     jjsm0205: "1",
  //     jjsm0203: name,
  //     jjsm0204: jobTitle,
  //     jjsm0206: ""
  //   }
  // }

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

  // let approveParam = {
  //   jjsm0201: auditDetail.jjsm0201,
  //   ahbx1501: auditDetail.hbx15Dto.ahbx1501,
  //   jjsm04DtoList: auditDetail.jjsm04VoList,
  //   jjsmShInfoDto: {
  //     axbe0001: "00000000000000000000000000000000",
  //     ahbx1402: 980,
  //     ahbx1411: 765,
  //     jjsm0209: "1",
  //     jjsm0207: "余强强",
  //     jjsm0208: "主任",
  //     jjsm0210: ""
  //   },
  //   year:"2025"
  // }
             
  return request.put(url, jujiaApproveParam);
}

/**
 * 居家养老上门服务-服务人员执行分派-查询列表
 * @param {*} size  分页查询数量
 * @param {*} flag  1 未分派， 2 已分派
 * @param {*} year  年份
 * @returns 
 */
export async function jujiaAllocList(flag, size=1, year=2025){
  let url = '/ylapi/ylpt/v24Visitingallocate/institutionAllocateList';

  let params = {
    current: 1,
    size: size,
    year: year,
    flag: flag,
  }

  return request.post(url, null, {params: params});
}


/**
 * 居家养老上门服务-服务费用确认-列表
 * @param {*} size  分页查询数量
 * @param {*} flag  0 未确认， 1 已确认
 * @param {*} year  年份
 * @returns 
 */
export async function jujiaFeeConfirmList(flag, size=1, year=2025){
  let url = '/ylapi/ylpt/v24Visitingallocate/serviceChargeList';

  let params = {
    current: 1,
    size: size,
    year: year,
    flag: flag,
  }

  return request.post(url, null, {params: params});
}


/**
 * 居家养老上门服务-服务费用确认-历史费用列表
 * @param {*} size  分页查询数量
 * @param {*} ahbx1501
 * @param {*} year  年份
 * @returns 
 */
export async function jujiaFeeHistoryList(ahbx1501, size=1, year=2025){
  let url = '/ylapi/ylpt/v24Visitingallocate/serviceChargeListHistory';

  let params = {
    current: 1,
    size: size,
    year: year,
    ahbx1501: ahbx1501,
  }

  return request.post(url, null, {params: params});
}

/**
 * 居家养老上门服务-服务费用确认-历史费用列表导出
 * @param {*} size  分页查询数量
 * @param {*} ahbx1501
 * @param {*} year  年份
 * @returns 
 */
export async function jujiaFeeHistoryExport(ahbx1501, year=2025){
  let url = '/ylapi/ylpt/v24Visitingallocate/serviceChargeListHistoryExport';

  let params = {
    year: year,
    ahbx1501: ahbx1501,
  }

  return request.post(url, null, {params: params, responseType: 'stream'});
}



/*******以上**********************************  居家养老上门服务  ****************************************** */



/********以下*********************************  家庭养老床位建设  ****************************************** */


/**
 * 
 * 家庭养老床位建设-根据行政区划code查询服务机构信息
 * 
 * ahbx1701   1 评估设计机构， 2 服务机构， 3 验收机构
 * 
 * 例如 areaCode='360428100000' ， 地区code不一样，数据可能不同，千万别错！
 * 
 */
export async function homeBedOrgList(areaCode, ahbx1701){
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

  // let homeBedApplyParam = {
  //   ahbx1601: ahbx1601,
  //   hbx15Dto: hbx15Dto,
  //   ssAxbe0001: axbe0001,
  // }

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

  // let approveParam = {
  //   ahbx1601: auditDetail.ahbx1601,
  //   cauditInfo: {
  //     ahbx1402: ahbx1402,
  //     ahbx1411: ahbx1411,
  //     ahbx1603: 1,
  //     ahbx1602: name,
  //     ahbx1605: jobTitle,
  //     ahbx1604: ""
  //   }
  // }

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
 * 家庭养老床位建设-审核-【区县账号】
 * 
 */
export async function homebedGovAuditApprove(homebedApproveParam){
  let url = '/ylapi/ylpt/v24ConstructionBed/bedBuildCountyAudit';

  // let homebedApproveParam = {
  //   ahbx1601: auditDetail.ahbx1601,
  //   year:  "2025",
  //   pgAxbe0001: pgAxbe0001,
  //   ysAxbe0001: ysAxbe0001,
  //   zauditInfo: {
  //     pgAxbe0001: pgAxbe0001,
  //     ysAxbe0001: ysAxbe0001,
  //     ahbx1402: ahbx1402,
  //     ahbx1411: ahbx1411,
  //     ahbx1607: 1,              // 审核状态， 0 不通过， 1 通过
  //     ahbx1606: name,
  //     ahbx1609: jobTitle,
  //     ahbx1608: ""
  //   }
  // }
             
  return request.post(url, homebedApproveParam);
}


/**
 * 
 * 家庭养老床位建设-完成-列表-【区县账号】
 * 
 */
export async function homebedGovCompleteList(size=1, year=2025){
  let url = '/ylapi/ylpt/v24ConstructionBed/bedBuildCountyCompleteAuditList';

  let params = {
    current: 1,
    size: size,
    year: year,
  }

  return request.post(url, null, {params: params});
}



/**
 * 
 * 家庭养老床位建设-服务人员分派-获取待分派列表
 * flag：1 未分配，2 已分配
 * 
 */
export async function homebedAllocList(size=1, flag=1, year=2025){
  let url = '/ylapi/ylpt/v24Allocate/institutionAllocateList';

  let params = {
    current: 1,
    size: size,
    year: year,
    flag: flag,
  }

  return request.post(url, null, {params: params});
}


/**
 * 
 * 家庭养老床位建设-服务人员分派-查询员工列表
 * 
 */
export async function homebedEmployeeList(){
  let url = '/ylapi/ylptjg/employee/queryEmployeeListByAxbe0001';

  return request.post(url);
}


/**
 * 
 * 家庭养老床位建设-服务人员分派-分配服务人员
 * 
 */
export async function homebedAllocSubmit(homebedAllocParam){

  let url = '/ylapi/ylpt/v24Allocate/institutionAllocate';

  // let homebedAllocParam = {
  //   ahbx1601: ahbx1601,
  //   ahbx1701: ahbx1701,
  //   ahdx6124: ahdx6124,
  //   axbe0001: axbe0001,
  //   year: year
  // }

  return request.post(url, homebedAllocParam);
}


/******以上********************************  家庭养老床位建设  ****************************************** */