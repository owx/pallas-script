#!/usr/bin/env node
import axios from 'axios';
import CryptoJS from 'crypto-js';

const defaultImei = "358800048894001";

/**
 * 智能腕表系统对接
 * https://openapi.miwitracker.com/
 */

const getTokenUrl = "https://openapi.miwitracker.com/api/token/get_token";       // 获取token
// put(2, "https://openapi.miwitracker.com/api/location/get_location_info"); // 查询手表信息
// put(3, "https://openapi.miwitracker.com/api/device/savedeviceinfo"); // 修改设备信息
// put(4, "https://openapi.miwitracker.com/api/geofence/create_geofence"); // 设置围栏
// put(5, "https://openapi.miwitracker.com/api/geofence/delete_geofence"); // 删除围栏
// put(6, "https://openapi.miwitracker.com/api/geofence/get_geofence_list"); // 获取围栏列表
// put(7, "https://openapi.miwitracker.com/api/command/sendcommand"); // 下发命令
// put(8, "https://openapi.miwitracker.com/api/command/commandlist"); // 查询命令


async function getAccessToken(){
  const appId = 711;
  const appKey = "21D631AD-3389-4AD0-94F2-EE3C1A8C73AA";
  const timestamp = Date.now();

  let passStr = appKey + appId + timestamp;
  let passwd = CryptoJS.MD5(passStr).toString();

  let body = {
    Password: passwd,
    AppId: appId,
    Timestamp: timestamp,
  }
  let resp = await axios.post(getTokenUrl, body)
  
  return resp.data.Result.AccessToken;
}

// const accessToken = await getAccessToken();
const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJMb2dpbkluZm8iOnsiVXNlcklkIjoxODU2NDEsIlVzZXJUeXBlIjoxMDAsIkFwcElkIjo3MTEsIk5hbWUiOiLljZfkuqzniLHmma7pm7flvrfnlLXlrZDnp5HmioDmnInpmZDlhazlj7giLCJUaW1lT2Zmc2V0Ijo4LjB9LCJleHAiOjE3NjA5NjA2NTguMH0.-QL7PFth1Rtk0Yr1z6HFEttCS06sFair1iKdrxwD9O8";
// console.log(accessToken)


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
const request = axios.create({baseURL: 'https://openapi.miwitracker.com'});
request.interceptors.request.use(config => {
  config.headers['Authorization'] = accessToken;
  return config;
});

export {request, accessToken, defaultImei};