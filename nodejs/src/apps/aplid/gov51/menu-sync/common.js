#!/usr/bin/env node
const axios = require('axios');

let Authorization = 'Bearer bbafd68a-cac0-4547-bf86-a27ab1a78a7f';

axios.interceptors.request.use(config => {
  config.headers['Authorization'] = Authorization;
  return config;
});

exports.addMenu = function(parentId, name, path, sort=999) {

    let data = {
        "name": "签到打卡",
        "path": "/aplid/dailyWork/signInCard/index",
        "type": "0",
        "keepAlive": "0",
        "sort": 999,
        "createChildren": "1",
        "adminMenu": 0,
        "deviceType": 0,
        "parentId": 16304
    };

    data.parentId = parentId
    data.name = name;
    data.path = path;
    data.sort = sort;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Authorization
      }
    };

    return axios.post('http://192.168.0.121:8088/admin/sysmenuadmin', data, config);
      // .then(response => {
      //   console.log('Success:', response.data);
      // })
      // .catch(error => {
      //   console.error('Error:', error);
      // });
};


exports.addPermission = function(parentId, name, permission, sort=999) {

    let data = {
        "name": "签到打卡导出",
        "permission": "staffPunchIn_export",
        "type": "1",
        "keepAlive": "0",
        "sort": 999,
        "createChildren": "1",
        "adminMenu": 0,
        "deviceType": 0,
        "parentId": 16216
    };

    data.parentId = parentId
    data.name = name;
    data.permission = permission;
    data.sort = sort;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Authorization
      }
    };

    axios.post('http://192.168.0.121:8088/admin/sysmenuadmin', data, config)
      .then(response => {
        // console.log('Success:', response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
};

/**
 * 
 *  在当前系统查找parentId是否存在
 * 
 * */
exports.findParentNode = function(nodeList, parentId){

    for(let i=0; i<nodeList.length; i++){
        if(nodeList[i].id == parentId){
            return nodeList[i];
        }

        if(nodeList[i].hasChildren){
            let res = exports.findParentNode(nodeList[i].children, parentId)
            if(res != null){
                return res;
            }
        }
    }

    return null;
}

/**
 * 
 *  查找新添加的菜单节点
 * 
 * */
exports.findNewAddedMenu = function(parentNode, name, path){
    let  childList =  parentNode.children;
    for(let j=0;  j<childList.length;  j++){
        if(childList[j].name == name && childList[j].path  == path){
            return childList[j];
        }
    }

    return null;
}

/**
 * 
 *  获取新增加的菜单节点
 * 
 * */
exports.getNewMenu = function(parentId, name,  path) {

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Authorization
      }
    };

    axios.get('http://192.168.0.121/admin/menu/getSelectMenu?devtype=0&adminMenu=0')
      .then(response => {

        let parentNode = exports.findParentNode(response.data.data.menuAdmins, parentId, name, path);
        let newMenuNode = exports.findNewAddedMenu(parentNode, name, path)

        // console.log(newMenuNode)

      })
      .catch(error => {
        console.error('Error:', error);
      });
};

exports.addMenuTree  = function(parentId, menuConfigData){

    if(menuConfigData && menuConfigData.path!=null){
      console.log("  >>add menu:" + menuConfigData.name)
      exports.addMenu(parentId, menuConfigData.name, menuConfigData.path)
        .then(response => {
            if(menuConfigData.hasChildren){
                // console.log('Success:', response.data);
                // exports.getNewMenu(parentId, menuConfigData.name, menuConfigData.path)
                axios.get('http://192.168.0.121/admin/menu/getSelectMenu?devtype=0&adminMenu=0')
                  .then(response => {

                    let parentNode = exports.findParentNode(response.data.data.menuAdmins, parentId);
                    let newMenuNode = exports.findNewAddedMenu(parentNode, menuConfigData.name, menuConfigData.path)

                    // console.log(newMenuNode)

                    for(let i=0; i<menuConfigData.children.length; i++){
                        exports.addMenuTree(newMenuNode.id, menuConfigData.children[i]);
                    }

                  })
                  .catch(error => {
                    console.error('Error:', error);
                  });
            }
          })
          .catch(error => {
            console.error('Error:', error);
          });
    }

    if(menuConfigData && menuConfigData.permission!=null){
        console.log("  >>add permission:" + menuConfigData.name);
        exports.addPermission(parentId, menuConfigData.name, menuConfigData.permission);
    }


}
