#!/usr/bin/env node
const axios = require('axios');
const aplid = require('./common')


// 1. 配置要添加的父节点信息
// let auth = 'Bearer f6257e0f-404a-4765-8e0e-1b5ff0f85cce';  // 后台管理员的token
let adminMenu = 0;     // 0.民政菜单， 1.租户菜单
let parentId = 16304;
// let name = "签到打卡1";
// let path  = "/aplid/dailyWork/signInCard/index";


  
// 2. 查询parentId是否真的存在
axios.get('http://192.168.0.121/admin/menu/getSelectMenu?devtype=0&adminMenu=' + adminMenu)
  .then(response => {
    let parentNode = aplid.findParentNode(response.data.data.menuAdmins, parentId);
    if(parentNode != null){
      console.log("正在给【"+ parentNode.name + "】添加菜单权限配置 >>>")

      // 3. 获取要添加的菜单配置内容，支持递归添加
      axios.get('https://yapi.njapld.com/mock/1229/getMenuConfigData')
      .then(response => {

        let menuConfigData = response.data;
        aplid.addMenuTree(parentId, menuConfigData);

        // console.log("菜单权限添加完成！<<<<\n");


      })
      .catch(error => {
        console.error('Error:', error);
      });

    }else{
      console.log("parentId 不存在")
    }

  })
  .catch(error => {
    console.error('Error:', error);
  });



// aplid.addMenu(parentId, name, path)
//aplid.getNewMenu(parentId, name, path);