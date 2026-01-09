#!/usr/bin/env node
import { axiosManager } from '#utils/AxiosManager.js';


/*************************** 基本配置 *********************************/

const authorization = 'bearer ad00ae6f-1406-4fe3-bac1-82900606456a';

const request = axiosManager.createInstance("mca", {
  baseURL: "https://chifeng-nx.njapld.com:7979",
  // baseURL: "https://apld-v6.njapld.com:20001",
  timeout: 60000,
  headers: {
    authorization: authorization,
  }
})





/*************************** 压测接口配置 *********************************/

export async function faceCompareOuter(faceUrl) {
  let url = '/management/face/compareOuter';

  let body ={
    "realName": "运营单位员工",
    "cardNo": "320115196401013243",
    "imageType": "jpeg",
    "imageContent": faceUrl
  }

  return request.post(url, body);
}
