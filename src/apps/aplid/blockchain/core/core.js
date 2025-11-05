#!/usr/bin/env node
import { axiosManager } from '#lib/AxiosManager.js';

const sjAplidToken = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9pZCI6IjNhMTk4NTY2LTFkZWUtNGFhNS05YjE5LWE2MTAzMGQ0ZTJjZCIsInVzZXJfbmFtZSI6InNqX2FwbGlkIiwic2NvcGUiOlsiYWxsIl0sImxvZ2luX2RhdGUiOjE3NjIyMzU3OTU0MTMsInN0YXRpb25fYWRtaW4iOmZhbHNlLCJpZCI6NDYsImV4cCI6MTc5MzMzOTc5NSwicGxhdGZvcm1fYWRtaW4iOmZhbHNlLCJhdXRob3JpdGllcyI6WyIyX-mDqOmXqOeuoeeQhuWRmCJdLCJqdGkiOiI4YzAyMmFjNy04ZTk4LTRkMTEtOWZiOS03MzU0NjE1NmVhY2EiLCJjbGllbnRfaWQiOiJhZG1pbi1hcHAiLCJ1c2VybmFtZSI6InNqX2FwbGlkIn0.m-3bXAkN6dDJACZhenbOmKh7AhAMq_2jeh3gDGXtQPDfUBx3fZP47IBdnewmwhjLQtPRo5uj9xJ-m67167kMwz1cCazPZrQXv-8d3bXu6KLPCNCcCiXrfXwNWfRd9BzjNCxm6IQ7WWlsgy3FWrOL5MvBU4gu-PZlqaeFpPVNqDJXlfRTlm7gH7ZZLu4EwxPeomeF13Oud3CmHmbpa8wVgEfoZ13Mwr2tMtxpsapqiWqMfLZwDMkT-juok7saW10uqeC_64tfMgI2sFv7O5YiYCwt-34RM9L7oBP_UzA99NY-FuPPn-fOhmcI81OGQiQW94R1sZC4Wr_x-YLJjkX3tg';
const jnAplidToken = "";
const glAplidToken = "";
const qhAplidToken = "";
const yhAplidToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9pZCI6IjZkZjk2MjJhLTJjOTAtNGZhMC1iYzc5LWIwNjBkZWI5ZDhhNCIsInVzZXJfbmFtZSI6InloX2FwbGlkIiwic2NvcGUiOlsiYWxsIl0sImxvZ2luX2RhdGUiOjE3NjIyNDIxODE0MzYsInN0YXRpb25fYWRtaW4iOmZhbHNlLCJpZCI6NTIsImV4cCI6MTc5MzM0NjE4MSwicGxhdGZvcm1fYWRtaW4iOmZhbHNlLCJhdXRob3JpdGllcyI6WyIyX-mDqOmXqOeuoeeQhuWRmCJdLCJqdGkiOiI2ZmQ3Y2Q5MS00OGQ4LTRkZjAtOTY0MC05MmQxM2ViNWQ2NmEiLCJjbGllbnRfaWQiOiJhZG1pbi1hcHAiLCJ1c2VybmFtZSI6InloX2FwbGlkIn0.RcHdJTf1LmwkjQ90nxRaFTTSuIwOiRniFEwq8hLyxjxOjgNDa1Rix3wBBNhB2R8yDj9XlyIm2V86QYvjKIj8M0bJ8fX5OImJZhEFOeOSid-1RMqJbpd6XewNCnx_OMShq_7F3bQNHeXMm6m-r6XwCm2qYI3js3RO3Sf-yrZ3ZYhV9P2AOflBuMdDfqYy-FziWmGEuf5kt4PcY8apMUHyGmeVZe2B59yjwuuWWbFFImiaSK4ybjHOiKR1SPHzThL-l8K2KNxNJ9cePUjKF6OqH9V_nEtFxh7HARLnnctIVgZ2QPYmsQHb6fCd3PDcDg_-szKT0ff5I5VfSfhxyo-s2A";
const xwAplidToken = "";
const jyAplidToken = "";
const qxAplidToken = "";
const pkAplidToken = "";
const lhAplidToken = "";
const lsAplidToken = "";
const gcAplidToken = "";
const jbxqAplidToken = "";


const sjAplid = axiosManager.newInstance(sjAplidToken);
const jnAplid = axiosManager.newInstance(jnAplidToken);
const glAplid = axiosManager.newInstance(glAplidToken);
const qhAplid = axiosManager.newInstance(qhAplidToken);
const yhAplid = axiosManager.newInstance(yhAplidToken);
const xwAplid = axiosManager.newInstance(xwAplidToken);
const jyAplid = axiosManager.newInstance(jyAplidToken);
const qxAplid = axiosManager.newInstance(qxAplidToken);
const pkAplid = axiosManager.newInstance(pkAplidToken);
const lhAplid = axiosManager.newInstance(lhAplidToken);
const lsAplid = axiosManager.newInstance(lsAplidToken);
const gcAplid = axiosManager.newInstance(gcAplidToken);
const jbxqAplid = axiosManager.newInstance(jbxqAplidToken);


function switchAccount(account) {
  switch (account) {
    case "sjAplid":
      return sjAplid;

    case "jnAplid":
      return jnAplid;

    case "glAplid":
      return glAplid;

    case "qhAplid":
      return qhAplid;
  
    case "yhAplid":
      return yhAplid;

    case "xwAplid":
      return xwAplid;

    case "jyAplid":
      return jyAplid;

    case "qxAplid":
      return qxAplid;

    case "pkAplid":
      return pkAplid;

    case "lhAplid":
      return lhAplid;

    case "lsAplid":
      return lsAplid;

    case "gcAplid":
      return gcAplid;

    case "jbxqAplid":
      return jbxqAplid;
    
    default:
      return undefined;
  }
  
}



// 1. 市级账号操作

/**
 * 获取智能合约列表
 * @param {*} size 
 * @returns 
 */
export async function getContractList(size=1, mode=0){
  let url = '/back/gbsn-platform-center/tenant/apps';

  let params = {
    mode: mode,
    pageNum: 1,
    pageSize: size,
  }

  return sjAplid.get(url, {params: params});
}

/**
 * 获取合约详情信息
 * @param {*} contractId 
 * @param {*} mode 
 * @returns 
 */
export async function getContractDetail(contractId, mode=0){
  let url = '/back/gbsn-platform-center/tenant/contract/' + contractId;

  let params = {
    mode: mode,
    contractId: contractId,
  }

  return sjAplid.get(url, {params: params});
}

/**
 * 获取合约审核信息
 * @param {*} contractId 
 * @param {*} size 
 * @returns 
 */
export async function getAuditInfo(contractId, size=20){
  let url = '/back/gbsn-platform-center/tenant/apps/auditPage/' + contractId;

  let params = {
    contractId: contractId,
    pageNum: 1,
    pageSize: size,
  }

  return sjAplid.get(url, {params: params});
}

// 2. 区级账号操作

/**
 * 合约审批（区账号，市区账号？）
 * @param {*} contractId 
 * @returns 
 */
export async function contractAudit(contractId, account=""){
  let url = '/back/gbsn-platform-center/tenant/contractAudit';
  const params = new URLSearchParams();
    params.append('contractId', contractId);
    params.append('result', true);

  return switchAccount(account).post(url, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
}


// export async function upgradeRequests(contractId){
//   let url = '/back/gbsn-platform-center/tenant/apps/upgradeRequests';

//   let params = {
//     pageNum: 1,
//     pageSize: size,
//   }

//   return yhAplid.get(url, {params: params});
// }
