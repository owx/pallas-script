#!/usr/bin/env node
import { axiosManager } from '#utils/AxiosManager.js';


/*************************** 基本配置 *********************************/

const authorization = 'Bearer ae7b11f3-0754-432a-a52b-5d2334f2b8f7';

const request = axiosManager.createInstance("mca", {
  baseURL: "https://zhyl-lishui.njapld.com:8081",
  // baseURL: "https://192.168.0.118:36749",
  // baseURL: "https://chifeng-nx.njapld.com:7979",
  // baseURL: "https://apld-v6.njapld.com:20001",
  timeout: 60000,
  headers: {
    authorization: authorization,
    "tenant-id": 203,
  }
})





/*************************** 压测接口配置 *********************************/

// 1. 6.0平台人脸识别对比
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

// 2. 溧水5.1系统工单重复创建问题排查
export async function lsCreateGovOrder() {
  let url = '/core/order/saveOrder';

  let body = {
    "actualPrice": "60.0",
    "beforePhotoTime": "2026-02-03 10:59:52",
    "beforeServicePic": "/admin/sys-file/aplid-51/1770087518068cc055d86-b673-476c.jpg",
    "belongProject": "govBuyManage",
    "civilSubprojectId": "3085",
    "identifyType": 0,
    "initFrom": 2,
    "lat": "32.028039",
    "lon": "118.917444",
    "oldmanId": "65846",
    "oldmanIdCard": "710000192811020264",
    "operateStatus": 6,
    "orderLevel": 0,
    "orderServiceItemsList": [
    {
    "num": 1,
    "servicesId": 1009,
    "servicesName": "头部按摩"
    }
    ],
    "orderSource": 3,
    "orderType": "1",
    "organizationId": 1743,
    "serviceObjectId": "65846",
    "serviceObjectIdcard": "710000192811020264",
    "serviceObjectName": "喻绮兰",
    "serviceObjectPhone": "13165384245",
    "shouldPrice": "60.0",
    "startStaffFace": "/admin/sys-file/aplid-51/17700875256451d458ab4-9394-4f3d.jpg",
    "subprojectId": "3085",
    "subprojectName": "2025年朝阳区政府购买测试项目",
    "tenantId": 203,
    "waiterServiceId": "7797"
    }

  return request.post(url, body);
}

export async function lsCreateShequOrder() {
  let url = '/core/order/saveOrder';

  let body = {
    "actualPrice": "60.0",
    "address": "屏溪佳苑8栋1单元102",
    "beforeServicePic": "/admin/sys-file/aplid-51/177009105736767348d90-539d-40e4.jpg",
    "belongProject": "homeElderlyService",
    "civilSubprojectId": "-1",
    "identifyType": 0,
    "initFrom": 2,
    "isCollective": 0,
    "lat": "32.028037",
    "lon": "118.917447",
    "oldmanIdCard": "320124194311270614",
    "operateStatus": 6,
    "orderLevel": 0,
    "orderServiceItemsList": [
    {
    "num": 1,
    "servicesId": 1007,
    "servicesName": "打扫卫生"
    }
    ],
    "orderSource": "3",
    "orderType": "1",
    "organizationId": 1743,
    "serviceLocation": "屏溪佳苑8栋1单元102",
    "serviceObjectId": "66236",
    "serviceObjectIdcard": "320124194311270614",
    "serviceObjectName": "老人",
    "serviceObjectPhone": "13705148766",
    "shouldPrice": "60.0",
    "startStaffFace": "/admin/sys-file/aplid-51/1770091101977ede8d7f4-d0b1-4cfc.jpg",
    "subprojectId": "-1",
    "tenantId": 203,
    "waiterServiceId": "7797"
  }

  return request.post(url, body);
}
