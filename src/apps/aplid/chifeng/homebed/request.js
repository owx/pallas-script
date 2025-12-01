#!/usr/bin/env node
import axios from 'axios';
 
// Bearer e673f832-397f-4d20-bf96-143eecc3e105
// Bearer 706e1f21-8347-4259-ab32-73f6718c1e68
const authorization = 'Bearer 14eb70a0-bfb5-4b0b-9e49-331d804fcfac';

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
const request = axios.create({baseURL: 'https://chifeng-nx.njapld.com:7979'});
request.interceptors.request.use(config => {
  config.headers['Authorization'] = authorization;
  config.headers['Content-type'] = 'application/json';
  return config;
});

export default request;