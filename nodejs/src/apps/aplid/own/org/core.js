#!/usr/bin/env node
import { axiosManager } from '#utils/AxiosManager.js';

/**
 * 机构系统
 * https://org-mange-new.njapld.com/
 */

const authorization = 'Bearer 42258aa0-002b-40d1-826d-c463e705d1ab';
const tenantId = '1957721932958339073';
const deptId = '1957721932958339073';

const request = axiosManager.createInstance("mca", {
  // baseURL: "https://org-mange.njapld.com",
  baseURL: "https://org-mange-new.njapld.com",
  timeout: 60000,
  headers: {
    "tenant-Id": tenantId,
    authorization: authorization,
  }
})


/*****************************************  通用接口  ****************************************** */

/**
 * 
 * 查询当前租户菜单
 * 
 */
export async function getTenantMenuTree(){
  let url = '/api/admin/menu/tree';

  let params = {
    deviceType: 2,
  }

  return request.get(url, {params: params});
}

/**
 * 
 * 查询项目详情
 * 
 */
export async function addMenuItem(menuItemData){
  let url = '/api/admin/menu';

  // let params = {
  //   "parentId":"1",
  //   "menuType":"0",
  //   "deviceType":2,
  //   "showTag":1,
  //   "visible":0,
  //   "keepAlive":"0",
  //   "name":"测试菜单项目",
  //   "path":"/test"
  // }

  return request.post(url, menuItemData);
}
