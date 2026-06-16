#!/usr/bin/env node
import { axiosManager } from '#utils/AxiosManager.js';


/**
 * 公安查询服务
 */
// const authorization = 'Bearer 270f56ca-7b90-401c-87c0-063119a751a3';

const request = axiosManager.createInstance("gongan", {
    // baseURL: "http://localhost:7001",
    baseURL: "http://192.168.0.66",
    timeout: 60000,
    headers: {
        // authorization: authorization,
    }
})



/**************************************************************************************************** */

/**
 * 南京常住人口简项查询接口
 * @param {*} idCard 
 * @returns 
 */
export async function queryNjCzrkWithZd(idCard){
    let token = "";
    let data = {
      "gmsfzh": idCard,
    }
  
    return request.post('/open/gov/gongan/queryNjCzrkWithZd', data);
}

