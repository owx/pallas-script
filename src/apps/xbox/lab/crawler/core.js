#!/usr/bin/env node
import { axiosManager } from '#utils/AxiosManager.js';



const authorization = 'Bearer 17d03e42-61e5-4f8f-a564-79970b3e38ab';
const request = axiosManager.createInstance("mca", {
  baseURL: "https://ylfw.mca.gov.cn",
  timeout: 60000,
  headers: {
    authorization: authorization,
  }
})


export async function homeBedOrgList(areaCode, ahbx1701){
  let url = '/ylapi/ylpt/v24ConstructionBed/queryHae1InfoList';

  let params = {
    ahbx1701: ahbx1701,
    areaCode: areaCode,
  }

  return request.post(url, null, {params: params});
}
