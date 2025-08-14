#!/usr/bin/env node
import axios from 'axios';

/**
 * 呼叫回访系统-自用版
 * https://yining-sv.njapld.com:20001/
 */

let authorization = 'Bearer 00a55c04-c48d-4d8d-8b5d-263c2f997d6a';
axios.interceptors.request.use(config => {
  config.headers['Authorization'] = authorization;
  return config;
});


/**
 *  伊宁核查获取菜单数据
 */
export function queryMenuTree(name, idCard) {
  let params = {
    menuName: '',
    current: 1,
    size: 10,
    // pageParaPO%5Bcurrent%5D=1&
    // pageParaPO%5Bsize%5D=10&
    descs: '',
    ascs: '',
  }

  return axios.get('https://yining-sv.njapld.com:20001/api/admin/menu/tree',  {params: params});
}


/**
 *  伊宁核查-查询菜单详情
 */
export function queryMenuDetail(menuName) {
  let params = {
    name: menuName
  }

  return axios.get('http://192.168.0.124:18088/api/admin/menu/details', {params: params});
}

/**
 *  伊宁核查-查询菜单详情
 */
export function queryMenuByParentId(parentId) {
  let params = {
    parentId: parentId
  }

  return axios.get('http://192.168.0.124:18088/api/admin/menu/tree',  {params: params});
}

/**
 *  伊宁核查-添加菜单项
 *  插入单个菜单&权限数据
 */
function addMenuItem(parentId, menuItem) {

  // let menuItem=     {
  //   "menuId": "",
  //   "name": "TESTXXX菜单",
  //   "permission": "",
  //   "parentId": "-1",
  //   "icon": "",
  //   "path": "/testmenu",
  //   "param": "0",
  //   "component": "",
  //   "sortOrder": 0,
  //   "menuType": "0",
  //   "keepAlive": "0",
  //   "visible": "1",
  //   "embedded": "0"
  // };

  // let permissionItem = {
  //   "menuId": "",
  //   "name": "权限测试TEST",
  //   "permission": "test_xxx",
  //   "parentId": "-1",
  //   "icon": "",
  //   "path": "",
  //   "param": "0",
  //   "component": "",
  //   "sortOrder": 0,
  //   "menuType": "1",
  //   "keepAlive": "0",
  //   "visible": "1",
  //   "embedded": "0"
  // };

  if(parentId==null){
    console.log("parentId is null");
    return;
  }

  let data = {
    ... menuItem,
    parentId: parentId,
  }

  return axios.post('http://192.168.0.124:18088/api/admin/menu', data);
}


/**
 *  伊宁核查-添加菜单树
 *  递归插入菜单树
 */
export async function insertMenuTree(parentId, menuTree, deep=0) {
  // console.log(menuTree)

  let idx=0;
  for(const item of menuTree){
    if(item.menuType==null){
      console.log("invalid menuType:", item);
      return;
    }

    if(item.name==null){
      console.log("invalid name:", item);
      return;
    }

    let menuItem= {
      "menuId": "",
      "name": item.name,
      "permission": item.permission,
      "parentId": parentId,
      "icon": "",
      "path": item.path,
      "param": "0",
      "component": "",
      "sortOrder": idx+1,
      "menuType": item.menuType,
      "keepAlive": "0",
      "visible": "1",
      "embedded": "0"
    };

    //invoke addMenuItem
    let newParentId = null;
    await addMenuItem(parentId, menuItem).then((resp)=>{
      newParentId = resp.data.data.menuId;
      console.log("Add Menu: " + '--'.repeat(deep) + '> ' + menuItem.name + " - " + menuItem.menuType + " - " + newParentId);

      // console.log("newParentId", newParentId)
    })

    if(item.children!=null && item.children.length>0){
      // console.log(item.children)
      insertMenuTree(newParentId, item.children, deep+1); 
    }

    idx++;
  }
}


/**
 *  伊宁核查-删除菜单项
 */
function delMenuItem(menuId) {

  if(menuId==null){
    console.log("menuId is null");
    return;
  }

  return axios.delete('http://192.168.0.124:18088/api/admin/menu/' + menuId);
}


/**
 *  伊宁核查-删除菜单树
 *  遍历删除菜单树， 有子菜单的先删，需要多轮执行
 */
export async function delMenuTree(parentId, parentName="", deep=0) {

  if(parentId=="-1"){
    console.log("Not allowed to delete ROOT MENU !!!");
    return;
  }

  if(parentId==null){
    console.log("parentId is null");
    return;
  }

  await queryMenuByParentId(parentId).then((resp)=>{
    // console.log(resp.data)
    let menuList=resp.data.data;

    if(menuList == null || menuList.length==0){

      // 根据parentId未查询到子菜单，直接删除当前parentId菜单
      delMenuItem(parentId).then((resp2)=>{
        console.log("Delete Menu: "  +  '--'.repeat(deep) + '> '  + parentName + '    => Done');

        // console.log(resp2.data)
      })

    }else{

      // 存在子菜单，则对子菜单进行删除操作
      for(const menuItem of menuList){
        delMenuTree(menuItem.id, menuItem.name,  deep + 1);
      }

    }

  })

}

/**
 * 
 * 全国养老服务信息平台（机构端）
 * 2024年提升行动项目
 * 居家养老上门服务
 * 服务检查验收
 * 
 * 查询员工信息
 * 
 */
// exports.queryEmployee = ()=>{
//   return axios.post('https://ylfw.mca.gov.cn/ylapi/ylptjg/employee/queryEmployeeListByAxbe0001');
// }


/**
 * 
 * 全国养老服务信息平台（机构端）-2024年提升行动项目
 * 
 * size: 分页大小默认1
 * type: jtylcwjs 家庭养老床位建设， jjylsmfw 居家养老上门服务
 * flag：1 未分配，2 已分配
 * 
 */
// exports.queryTask = (size=1, type='jtylcwjs', flag=1)=>{

//   let url = undefined;

//   if( type==='jtylcwjs'){

//     // 家庭养老床位建设
//     url = 'https://ylfw.mca.gov.cn/ylapi/ylpt/v24Allocate/institutionAllocateList';

//   }else if( type==='jjylsmfw'){

//     // 居家养老上门服务-服务检查验收
//     url = 'https://ylfw.mca.gov.cn/ylapi/ylpt/v24Visitingallocate/institutionJDAllocateList';
    
//   }else{

//     return  null;
//   }


//   let params = {
//     current: 1,
//     size: size,
//     year: 2024,
//     flag: flag,
//   }

//   return axios.post(url, null, {params: params});
//     // .then(response => {
//     //   // console.log(JSON.stringify(response.data))
//     //   console.log(response.data)
//     // })
//     // .catch(error => {
//     //   console.error('Error:', error);
//     // });
// }



// exports.assignTask = ( ahbx1501, ahdx6124)=>{
//   let params = {
//     // ahbx1501: 'a6777e2c2f904881adaca58ce8bdffce',
//     ahbx1501: ahbx1501,
//     year: 2024,
//     // ahdx6124: '725db84e398741a78d5e42460d9691d8',
//     ahdx6124: ahdx6124,
//   }

//   return  axios.post('https://ylfw.mca.gov.cn/ylapi/ylpt/v24Visitingallocate/institutionJDAllocate', null, {params: params})
// }
