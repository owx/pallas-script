#!/usr/bin/env node
import axios from 'axios';

class AxiosManager {

  baseUrl="http://180.101.239.5:11762/bc";
  timeout=5000;
  authorization = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9pZCI6ImM4ZDE3MDZhLWY1MDQtNGNkNC04N2RmLTZjODA2MTRkNGEyMCIsInVzZXJfbmFtZSI6InNqX2FwbGlkIiwic2NvcGUiOlsiYWxsIl0sImxvZ2luX2RhdGUiOjE3NjIyMzI4MjYxMDUsInN0YXRpb25fYWRtaW4iOmZhbHNlLCJpZCI6NDYsImV4cCI6MTc5MzMzNjgyNiwicGxhdGZvcm1fYWRtaW4iOmZhbHNlLCJhdXRob3JpdGllcyI6WyIyX-mDqOmXqOeuoeeQhuWRmCJdLCJqdGkiOiI1MzY0ZDY1NC0yZTBhLTRjNmEtYmJhMS02NGZiZWQxNTRkYzciLCJjbGllbnRfaWQiOiJhZG1pbi1hcHAiLCJ1c2VybmFtZSI6InNqX2FwbGlkIn0.kXoIvRTAAGViiK1j0CnQz95wrwlC9L2WuHltLCZAjQSQDfUrFAlEcxXGSenhBeKNOfJ0xBueYkKcDMn9oy83oQgyhqfgWDuRa0ZTrMLJTJZAvujyRYvJT7Owy9LJuwW3kErjbuvk4wGpJjQAQQqXb4Pxq9844SGe_9KX5gR3egW1iDItnPOk7F3vVAlrjOfnseiKPq_i0lsgDhY5bSmgAZfk9-Vr9pWWtbdRg36TQJR1oypV6pFzhWFRY_keI5ew9s5zK_VFEyPB97aoSBb5R-fkrqyvH-0oe_wKgVXhkETLCekftqjogj5i40wI7NNL5P6QrRcb40RCtlQmxdygHw';

  constructor() {
      this.instances = new Map();
  }
  
  /**
   * 创建全新的axios实例
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
   * 使用全局配置创建临时实例，不加入实例管理列表
   * @param {*} token 若提供使用该token，否则使用默认token
   * @returns 
   */
  newInstance(token) {
    const instance = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Authorization': token?token:this.authorization,
      }
    });
    return instance;
  }

  /**
   * 使用全局配置创建实例
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
   * 获取一个已经创建的实例
   * @param {*} name 
   * @returns 
   */
  getInstance(name) {
    return this.instances.get(name);
  }
  
  // 删除实例
  removeInstance(name) {
    this.instances.delete(name);
  }
}

// 使用管理器
export const axiosManager = new AxiosManager();

// 创建不同配置的实例
// axiosManager.createInstance('mainApi', {
//   baseURL: 'http://180.101.239.5:11762/bc',
//   timeout: 5000,
//   headers: {
//     'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9pZCI6ImM4ZDE3MDZhLWY1MDQtNGNkNC04N2RmLTZjODA2MTRkNGEyMCIsInVzZXJfbmFtZSI6InNqX2FwbGlkIiwic2NvcGUiOlsiYWxsIl0sImxvZ2luX2RhdGUiOjE3NjIyMzI4MjYxMDUsInN0YXRpb25fYWRtaW4iOmZhbHNlLCJpZCI6NDYsImV4cCI6MTc5MzMzNjgyNiwicGxhdGZvcm1fYWRtaW4iOmZhbHNlLCJhdXRob3JpdGllcyI6WyIyX-mDqOmXqOeuoeeQhuWRmCJdLCJqdGkiOiI1MzY0ZDY1NC0yZTBhLTRjNmEtYmJhMS02NGZiZWQxNTRkYzciLCJjbGllbnRfaWQiOiJhZG1pbi1hcHAiLCJ1c2VybmFtZSI6InNqX2FwbGlkIn0.kXoIvRTAAGViiK1j0CnQz95wrwlC9L2WuHltLCZAjQSQDfUrFAlEcxXGSenhBeKNOfJ0xBueYkKcDMn9oy83oQgyhqfgWDuRa0ZTrMLJTJZAvujyRYvJT7Owy9LJuwW3kErjbuvk4wGpJjQAQQqXb4Pxq9844SGe_9KX5gR3egW1iDItnPOk7F3vVAlrjOfnseiKPq_i0lsgDhY5bSmgAZfk9-Vr9pWWtbdRg36TQJR1oypV6pFzhWFRY_keI5ew9s5zK_VFEyPB97aoSBb5R-fkrqyvH-0oe_wKgVXhkETLCekftqjogj5i40wI7NNL5P6QrRcb40RCtlQmxdygHw'
//   }
// });

// axiosManager.addInstance('cityAccount');
// axiosManager.addInstance('jyAccount', "newtoken1");
// axiosManager.addInstance('jnAccount', "newtoken2");


// 使用实例
// async function useInstances() {
//   const mainApi = apiManager.getInstance('mainApi');
//   const paymentApi = apiManager.getInstance('paymentApi');
  
//   const user = await mainApi.get('/users/123');
//   const payment = await paymentApi.post('/payments', { amount: 100 });
// }