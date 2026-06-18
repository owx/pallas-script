#!/usr/bin/env node
import fs from 'fs';
import PQueue from 'p-queue';
import { logger } from '#utils/LoggerUtils.js'
import { getTenantMenuTree, addMenuItem } from "./core.js";


// 1. 通用任务-所有业务都用
const queue = new PQueue({
  intervalCap: 1,   // 每个时间窗口内最多执行的任务数
  interval: 1000,   // 时间窗口长度（毫秒）
  concurrency: 1,      // 并发数（可选，默认 Infinity）
});


/*******************************************************  机构系统-重构租户菜单树  *****************************************************************/
export async function refactorTenantMenuTree(menuTreeFile='./full_menu.json') {
  const data = fs.readFileSync(menuTreeFile, 'utf8');
  const menuTree = JSON.parse(data);

  console.log('Menu tree loaded successfully:', menuTree);
  await traverseMenuTree("-1", menuTree, queue)

}


async function traverseMenuTree(parrentId, menuTree, queue) {
  if (!menuTree || !Array.isArray(menuTree)) {
    return;
  } 

  for (const item of menuTree) {
    logger.info('处理菜单项:', item.name , item.parentId );
    item.parentId = null;

    await queue.add(async () => {
      // 1. 创建当前菜单项，parentId为父菜单的id，name为菜单项的名称
      const newItem = {
        component: item.component==null?undefined:item.component,
        permission: item.permission==null?undefined:item.permission,
        deviceType: 2,
        parentId: parrentId,
        menuType: item.menuType,
        icon: item.icon,
        sort: item.sortOrder,
        showTag: 1,
        visible: item.visible,
        keepAlive: item.keepAlive,
        name: item.name,
        path: item.path,
      };

      const resp = await addMenuItem(newItem);

      if (resp && resp.data) { // 如果添加成功，继续处理子菜单
        logger.info('Created menu item:', newItem.name , newItem.parentId );
      } else {
        logger.error('Failed to create menu item:', item.name , item.parentId );
        return;
      }
      const newSysMenu = resp.data.data;
      const newParentId = newSysMenu.menuId; // 更新父菜单id为当前菜单项的id
      // logger.info('新添加的菜单项信息:', newSysMenu );
      
      // 2. 获取当前菜单项的子菜单，创建子菜单
      if (item.children && Array.isArray(item.children)) {
        traverseMenuTree(newParentId, item.children, queue);
      }

    });
  }
}
