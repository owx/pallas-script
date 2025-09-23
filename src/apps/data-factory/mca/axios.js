#!/usr/bin/env node
import axios from 'axios';


// 全国养老服务信息系统
// 全国养老服务信息平台（管理端）
// 2025年提升行动项目
// 居家养老上门服务
// 街道申请，街道审批，县审批


// 
/**
 * 全国养老服务信息系统
 * https://ylfw.mca.gov.cn/
 */
let Authorization = 'Bearer 22f509c6-757a-4be7-aa57-af435abd3680';
axios.interceptors.request.use(config => {
  config.headers['Authorization'] = Authorization;
  return config;
});

export default axios;