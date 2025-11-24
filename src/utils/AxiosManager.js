#!/usr/bin/env node
import axios from 'axios';

/**
 * 全局拦截器
 */
// axios.interceptors.request.use(config => {
//   config.headers['Authorization'] = Authorization;
//   return config;
// });

/**
 * 实例拦截器
 */
// const request = axios.create();
// const request = axios.create({baseURL: 'https://ylfw.mca.gov.cn'});
// request.interceptors.request.use(config => {
//   config.headers['Authorization'] = authorization;
//   return config;
// });

class AxiosManager {

  gConfig;

  constructor(config) {
      this.instances = new Map();
      this.gConfig = config;
  }
  
  /**
   * 1. 使用单独的config，创建axios实例
   * @param {*} name 
   * @param {*} config 
   * @returns 
   */
  createInstance(name, config) {
    const instance = axios.create(config);
    this.instances.set(name, instance);
    return instance;
  }

  /**
   * 2. 使用全局config配置创建临时实例，不加入实例管理列表
   * @param {*} token 若提供使用该token，否则使用默认token
   * @returns 
   */
  newInstance(token) {
    const instance = axios.create({
      ...this.gConfig,
      headers: {
        'Authorization': token,
      }
    });
    return instance;
  }

  /**
   * 3. 使用全局config配置创建实例
   * @param {*} name 
   * @param {*} token 若提供使用该token，否则使用默认token
   * @returns 
   */
  addInstance(name, token) {
    const instance = this.newInstance(token)
    this.instances.set(name, instance);
    return instance;
  }

  /**
   * 4. 获取一个已经创建的实例
   * @param {*} name 
   * @returns 
   */
  getInstance(name) {
    return this.instances.get(name);
  }
  
  // 5. 删除实例
  removeInstance(name) {
    this.instances.delete(name);
  }

}
export default AxiosManager;
export const axiosManager = new AxiosManager();
// export const bcAxiosManager = new AxiosManager({
//   baseURL: "http://180.101.239.5:11762/bc",
//   timeout: 5000,
//   headers: {
//     authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9pZCI6ImM4ZDE3MDZhLWY1MDQtNGNkNC04N2RmLTZjODA2MTRkNGEyMCIsInVzZXJfbmFtZSI6InNqX2FwbGlkIiwic2NvcGUiOlsiYWxsIl0sImxvZ2luX2RhdGUiOjE3NjIyMzI4MjYxMDUsInN0YXRpb25fYWRtaW4iOmZhbHNlLCJpZCI6NDYsImV4cCI6MTc5MzMzNjgyNiwicGxhdGZvcm1fYWRtaW4iOmZhbHNlLCJhdXRob3JpdGllcyI6WyIyX-mDqOmXqOeuoeeQhuWRmCJdLCJqdGkiOiI1MzY0ZDY1NC0yZTBhLTRjNmEtYmJhMS02NGZiZWQxNTRkYzciLCJjbGllbnRfaWQiOiJhZG1pbi1hcHAiLCJ1c2VybmFtZSI6InNqX2FwbGlkIn0.kXoIvRTAAGViiK1j0CnQz95wrwlC9L2WuHltLCZAjQSQDfUrFAlEcxXGSenhBeKNOfJ0xBueYkKcDMn9oy83oQgyhqfgWDuRa0ZTrMLJTJZAvujyRYvJT7Owy9LJuwW3kErjbuvk4wGpJjQAQQqXb4Pxq9844SGe_9KX5gR3egW1iDItnPOk7F3vVAlrjOfnseiKPq_i0lsgDhY5bSmgAZfk9-Vr9pWWtbdRg36TQJR1oypV6pFzhWFRY_keI5ew9s5zK_VFEyPB97aoSBb5R-fkrqyvH-0oe_wKgVXhkETLCekftqjogj5i40wI7NNL5P6QrRcb40RCtlQmxdygHw',
//   }
// });



/*******************************************  使用方法  ******************************************************/

// 1. 创建不同配置的实例
// axiosManager.createInstance('mainApi', {
//   baseURL: 'http://180.101.239.5:11762/bc',
//   timeout: 5000,
//   headers: {
//     'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9pZCI6ImM4ZDE3MDZhLWY1MDQtNGNkNC04N2RmLTZjODA2MTRkNGEyMCIsInVzZXJfbmFtZSI6InNqX2FwbGlkIiwic2NvcGUiOlsiYWxsIl0sImxvZ2luX2RhdGUiOjE3NjIyMzI4MjYxMDUsInN0YXRpb25fYWRtaW4iOmZhbHNlLCJpZCI6NDYsImV4cCI6MTc5MzMzNjgyNiwicGxhdGZvcm1fYWRtaW4iOmZhbHNlLCJhdXRob3JpdGllcyI6WyIyX-mDqOmXqOeuoeeQhuWRmCJdLCJqdGkiOiI1MzY0ZDY1NC0yZTBhLTRjNmEtYmJhMS02NGZiZWQxNTRkYzciLCJjbGllbnRfaWQiOiJhZG1pbi1hcHAiLCJ1c2VybmFtZSI6InNqX2FwbGlkIn0.kXoIvRTAAGViiK1j0CnQz95wrwlC9L2WuHltLCZAjQSQDfUrFAlEcxXGSenhBeKNOfJ0xBueYkKcDMn9oy83oQgyhqfgWDuRa0ZTrMLJTJZAvujyRYvJT7Owy9LJuwW3kErjbuvk4wGpJjQAQQqXb4Pxq9844SGe_9KX5gR3egW1iDItnPOk7F3vVAlrjOfnseiKPq_i0lsgDhY5bSmgAZfk9-Vr9pWWtbdRg36TQJR1oypV6pFzhWFRY_keI5ew9s5zK_VFEyPB97aoSBb5R-fkrqyvH-0oe_wKgVXhkETLCekftqjogj5i40wI7NNL5P6QrRcb40RCtlQmxdygHw'
//   }
// });

// bcAxiosManager.addInstance('cityAccount');
// bcAxiosManager.addInstance('jyAccount', "newtoken1");
// bcAxiosManager.addInstance('jnAccount', "newtoken2");


// 2. 使用实例
// async function useInstances() {
//   const mainApi = bcAxiosManager.getInstance('mainApi');
//   const paymentApi = bcAxiosManager.getInstance('paymentApi');
  
//   const user = await mainApi.get('/users/123');
//   const payment = await paymentApi.post('/payments', { amount: 100 });
// }