#!/usr/bin/env node
import readline from 'readline';

// import { queryMenuTree, queryMenuByParentId, insertMenuTree, delMenuTree } from './core-visit.js';
// import { menuConfig } from './sample.js';
import { addSysMenuTreeList, removeMenuTree } from './core-5.1.js';

import { menuTree, orgMenu, govMenu } from './data/sample-yining5.1.js';


yining51_menu();

function refactorMenuTree(){

  // queryMenuTree().then((resp)=>{
  //   console.log(resp.data)
  //   // console.log(JSON.stringify(resp.data))
  // })

  // console.log(menuConfig)

  // addMenuItem( '-1',  menuItem ).then((resp)=>{
  //   console.log(resp.data)
  // })

  // insertMenuTree('-1', menuConfig.data);

  

  // queryMenuByParentId("1925449887214252033").then((resp)=>{
  //   console.log(resp.data)
  // })


  // delMenuTree("1925467585558130690");



}


function yining51_menu(){

  // queryMenuTree(1).then((resp)=>{
  //   console.log(resp.data.data)
  // })

  // console.log(govMenu.data);
  // console.log(menuTree);

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

  // addMenuItem('-1', menuItem, menuItem.type).then((resp)=>{
  //   console.log(resp.data)
  // })

  // querySysMenuList('-1').then((resp)=>{
  //   // console.log(resp.data)
  //   console.log(JSON.stringify(resp.data.data))

  // })

  // querySysMenuDetail('16425').then((resp)=>{
  //   console.log(resp.data)
  // })

  // 添加菜单，父菜单不能为-1
  // addSysMenuTreeList('16626', menuTree.children)

  removeMenuTree('16626');
  

}

