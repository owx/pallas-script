#!/usr/bin/env node
import axios from 'axios';

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

const authorization = 'Bearer 22289481-238d-4c64-a113-32518e6a0f4f';

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
const request = axios.create({baseURL: 'https://ylfw.mca.gov.cn'});
request.interceptors.request.use(config => {
  config.headers['Authorization'] = authorization;
  return config;
});

export default request;