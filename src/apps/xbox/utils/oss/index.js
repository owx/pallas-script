#!/usr/bin/env node
import { oss } from "./core/oss.ts";
import path from 'path';

export function xboxMain(ossPath, filePath){
    if(filePath === undefined){
        console.log("未指定上传文件路径");
        return;
    }


    // 获取文件名（包含扩展名）
    const fileNameWithExt = path.basename(filePath);
    console.log(fileNameWithExt);

    oss.uploadFromFile(ossPath + '/' + fileNameWithExt, filePath)

    
}
