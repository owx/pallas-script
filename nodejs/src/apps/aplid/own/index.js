#!/usr/bin/env node
import { refactorTenantMenuTree} from './org/menu.js'

export async function ownMain(mode, page, size, total, file, output) {

    switch(mode){

        /*************************************** 机构系统 ***********************************/

        case 'RefactorTenantMenuTree':
            // 重构租户菜单
            await refactorTenantMenuTree(file);


        default:
            console.log("ap own -m(mode)")
            console.log("\t-m RefactorTenantMenuTree \t机构系统-租户菜单重构")
            break;
    }

}