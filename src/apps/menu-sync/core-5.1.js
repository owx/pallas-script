#!/usr/bin/env node
import axios from 'axios';
import readline from 'readline';


/**
 * 伊宁5.1
 * https://yining.njapld.com:3999/
 */
let baseUrl='https://yining.njapld.com:3999';

let authorization = 'Bearer f09a7c19-116b-41f1-b458-8097137076a0';
axios.interceptors.request.use(config => {
  config.headers['Authorization'] = authorization;
  return config;
});


/**
 *  伊宁5.1
 *  获取所有平台菜单（非常慢，非常卡）
 *  @type  0:民政, 1:机构
 */
export function queryMenuTree(type=0) {
  let params = {
    devtype: 0,
    adminMenu: type,
  }

  return axios.get(baseUrl + '/admin/menu/getSelectMenu',  {params: params});
}


/**
 * 伊宁5.1
 * 根据parentId查询下级子菜单列表，不含再下一级的子菜单
 * 查询时尽量不要使用 -1， 因为-1代表根节点，会出现同时把民政和租户的菜单都查询出来
 * @parentId    父级菜单id
 * @type        菜单类型,0:菜单 1:按钮
 * @deviceType  终端类型  0:web；1:员工端app
 */
export function querySubSysMenu(parentId, deviceType=0, type) {
  let params = {
    parentId: parentId,
    deviceType: deviceType,
    type: type,
  }

  return axios.get(baseUrl + '/admin/sysmenuadmin/tree', {params: params});
}

/**
 * 伊宁5.1
 * 查询菜单详情信息
 * @menuId  菜单ID
 */
export function querySysMenuDetail(menuId) {
  if(menuId ==null){
    console.log("MenuId is null!")
    return;
  }

  return axios.get(baseUrl + '/admin/sysmenuadmin/' + menuId);
}


/**
 * 检查某个父菜单节点下面是否存在某个菜单
 * @param {*} parentId 父菜单节点ID
 * @param {*} menuName 需要查询的菜单名称
 * @returns 返回查询到的菜单ID数组，没有则返回null
 */
async function searchSubSysMenu(parentId, menuName){
  let menuIds = null;

  await querySubSysMenu(parentId).then((resp)=>{
    let addedMenuList = resp.data?.data?.filter(menu=> menu.name==menuName)
    if(addedMenuList==null || addedMenuList.length==0){
      // console.log('Menu not found: ' + menuName)
    }else{
      menuIds = addedMenuList.map(item=>item.id);
    }
  })

  return menuIds;
}


/**
 *  添加菜单项
 *  插入单个菜单&权限数据
 *  @adminMenu  0：民政, 1：租户
 *  @deviceType 终端类型  0:web；1:员工端app
 *  
 */
function addSysMenu(parentId, menuItem, adminMenu=1, deviceType=0) {

  if(menuItem.type == null){
    console.log('menu type is null!')
    return;
  }

  // let menuItem = {
  //   "name": "测试菜单可以删除",
  //   "path": "/testxxx",
  //   "type": "0",
  //   "keepAlive": "0",
  //   "sort": 999,
  //   "createChildren": "1",
  //   "adminMenu": 1,
  //   "deviceType": 0,
  //   "parentId": -1
  // }

  // let menuItem = {
  //   "name": "测试权限权限测试",
  //   "permission": "privillege_Test",
  //   "type": "1",
  //   "keepAlive": "0",
  //   "sort": 999,
  //   "createChildren": "1",
  //   "adminMenu": 1,
  //   "deviceType": 0,
  //   "parentId": -1
  // }

  if(parentId==null){
    console.log("parentId is null");
    return;
  }

  let data = {
    ... menuItem,
    parentId: parentId,
    adminMenu: adminMenu,
    deviceType: deviceType,
  }

  return axios.post(baseUrl + '/admin/sysmenuadmin', data);
}


/**
 * 伊宁5.1
 * 添加菜单列表, 递归插入菜单树
 * @parentId      父菜单ID
 * @menuTreeList  需要插入的菜单树列表，子菜单放入children字段中，也是列表形式
 * @adminMenu     0：民政, 1：租户
 * @deviceType    终端类型  0:web；1:员工端app
 * @deep          菜单深度，做记录用的，不用传参数
 */
export async function addSysMenuTreeList(parentId, menuTreeList,  adminMenu=1, deviceType=0, deep=0) {
  // console.log(menuTree)

  // 1. 检查是否给根目录添加菜单，因为给根目录添加的菜单很难校验是否添加成功，所以不支持直接添加到根目录
  if(parentId=='-1'){
    console.log('Not allowed to add menu for ROOT');
    return;
  }

  // 2. 遍历menuTreeList，依次进行菜单添加
  let idx=0;
  for(const item of menuTreeList){
    if(item.type==null){
      console.log("invalid type:", item);
      return;
    }

    if(item.name==null){
      console.log("invalid name:", item);
      return;
    }

    let menuItem= {
      "name": item.name,
      "path": item.path,
      "permission": item.permission,
      "type": item.type,
      "keepAlive": "0",
      "sort": 999,
      "createChildren": "1",
      // "adminMenu": adminMenu,
      // "deviceType": deviceType,
      "parentId": -1,
    };

    // 3. 检查当前要添加的menu是否已经存在, 已存在的跳过，不再添加包括他的子菜单
    let menuIds = await searchSubSysMenu(parentId, menuItem.name);
    // console.log(menuIds)
    if(menuIds!=null && menuIds.length>0){
      console.log("Add Menu: " + '--'.repeat(deep) + '> ' + menuItem.name + " - " + menuItem.type + " - " + parentId + '  Failed(existed)');
      continue;
    }

    // 4. 调用 addSysMenu 添加系统菜单
    await addSysMenu(parentId, menuItem, adminMenu, deviceType).then((resp)=>{
      // console.log(resp.data)
      // newParentId = resp.data.data.menuId;
    })

    // 5. 检查新添加的menu是否成功
    menuIds = await searchSubSysMenu(parentId, menuItem.name);
    // console.log(menuIds)
    if(menuIds == null){
      console.log("Add Menu: " + '--'.repeat(deep) + '> ' + menuItem.name + " - " + menuItem.type + " - " + parentId + '  Failed(add failed)');
      continue;
    }

    if(menuIds.length >1){
      console.log("Add Menu: " + '--'.repeat(deep) + '> ' + menuItem.name + " - " + menuItem.type + " - " + parentId + '  Failed(too many same menus)');
      continue;
    }

    console.log("Add Menu: " + '--'.repeat(deep) + '> ' + menuItem.name + " - " + menuItem.type + " - " + parentId + ' Success');
    let newParentId = menuIds[0];

    // 6. 判断新增加的菜单是否有子菜单需要添加，有的话进行递归添加
    if(item.children!=null && item.children.length>0){
      // console.log(">>> has submenu: " + newParentId)
      // console.log(item.children)
      addSysMenuTreeList(newParentId, item.children, adminMenu, deviceType, deep+1); 
    }

    idx++;
  }
}


/**
 * 根据id删除菜单
 * @param {*} menuId 
 * @returns 
 */
function delMenuItem(menuId) {

  if(menuId==null){
    console.log("menuId is null");
    return;
  }

  return axios.delete(baseUrl + '/admin/sysmenuadmin/' + menuId);
}

/**
 * 遍历删除菜单树， 有子菜单的先删，需要多轮执行
 * @param {*} parentId 
 * @param {*} parentName 
 * @param {*} deep 
 * @returns 
 */
async function delMenuTree(parentId, parentName="", deep=0) {

  if(parentId=="-1"){
    console.log("Not allowed to delete ROOT MENU !!!");
    return;
  }

  if(parentId==null){
    console.log("parentId is null");
    return;
  }

  // 1. 查询要删除的节点是否含有子菜单 
  let childMenuList = []
  await querySubSysMenu(parentId).then((resp)=>{
    childMenuList=resp.data.data;
  })
  // console.log(childMenuList)

  // 2. 若要删除的菜单有子菜单，则先删除子菜单 
  if(childMenuList!=null || childMenuList.length>0){
    for(let subMenu of childMenuList){
      await delMenuTree(subMenu.id, subMenu.name, deep+1);
    }
  }

  // 3. 最后删除当前菜单
  await delMenuItem(parentId);
  console.log("Delete Menu: "  +  '--'.repeat(deep) + '> '  + parentName + '    => Success');

}

/**
 * 删除菜单树
 * 指定菜单ID，删除此菜单以及此菜单下的所有子子子菜单
 * @param {string} menuId 
 */
export async function removeMenuTree(menuId){  

  await querySysMenuDetail(menuId).then((resp)=>{
    if(resp.data.data == null){
      console.log("删除失败：当前菜单ID不存在！")
    }else{
      let menuName = resp.data.data.name;

      // const rl = readline.createInterface({
      //   input: process.stdin,
      //   output: process.stdout
      // });
      // rl.question('请确认是否要删除菜单【' + menuName+ '】及其所有子菜单？(yes/no)', (confirm) => {
      //   if(confirm!=='yes'){
      //     console.log('操作已取消!\n')
      //     rl.close();
      //     return;
      //   }
      //   rl.close();
      // });

      console.log("开始删除菜单【" + menuName + "】及其子菜单数据...")
      delMenuTree(menuId, menuName)

    }
  })

}