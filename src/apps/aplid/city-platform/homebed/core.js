#!/usr/bin/env node
import { axiosManager } from '#utils/AxiosManager.js';


/*************************** 家庭床位建设 *********************************/

const authorization = 'Bearer 14eb70a0-bfb5-4b0b-9e49-331d804fcfac';

const request = axiosManager.createInstance("mca", {
  // baseURL: "https://chifeng-nx.njapld.com:7979",
  baseURL: "https://apld-v6.njapld.com:20001",
  timeout: 5000,
  headers: {
    authorization: authorization,
  }
})


/*************************** 1. 家床申请 *********************************/



/*************************** 2. 环境评估 *********************************/

export async function getEnvAssessList(subprojectId='1930932494178140162', size=1, envAssessmentApprovalStatus=3) {
  let url = '/management/fbEnvAssessment/page';

  let body ={
    "current": 1,
    "size": size,
    "isCancel": 0,
    "envAssessmentApprovalStatus": envAssessmentApprovalStatus,
    "subprojectId": subprojectId,
    "isTrusted": true,
    // "_vts": 1759043023658,
    "pageParaPO": {
      "current": 1,
      "size": size
    }
  }

  return request.post(url, body);
}

export async function getEnvAssessDetail(idCard='710000190611051585', subprojectId='1930932494178140162') {
    let url = '/management/fbEnvAssessment/one';

    let body = {
        idCard: idCard,
        subprojectId: subprojectId,
    }
  
    return request.post(url, body);
}


/*************************** 3. 实施改造 *********************************/

/**
 * 获取实施改造列表
 * @param {*} subprojectId 
 * @param {*} size 
 * @param {*} businessApprovalStatus 
 * @returns 
 */
export async function fbImplementPage(implementRenovationUnit, size=1, subprojectId='1954828803239837697', businessApprovalStatus=3) {
  let url = '/management/fbImplement/page';

  let body ={
    "current": 1,
    "size": size,
    "isCancel": 0,
    "businessApprovalStatus": businessApprovalStatus,
    "subprojectId": subprojectId,
    "implementRenovationUnit": implementRenovationUnit,
    "pageParaPO": {
      "current": 1,
      "size": size,
    }
  }

  return request.post(url, body);
}

/**
 * 获取实施改造详情
 * @param {*} id 
 * @param {*} idCard 
 * @param {*} subprojectId 
 * @returns 
 */
export async function fbImplementOne(id='1995367756300042242', idCard='652401196503150966', subprojectId='1954828803239837697') {
    let url = '/management/fbImplement/one';

    let body = {
      "id": id,
      "idCard": idCard,
      "subprojectId": subprojectId,
    }
  
    return request.post(url, body);
}


/*************************** 4. 验收管理 *********************************/
