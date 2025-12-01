#!/usr/bin/env node
import fs from 'fs';
import PQueue from 'p-queue';
import { encryptUtil } from '#src/utils/EncryptUtil.ts';
import { zipFolderWithAdm, downloadFiles } from '#src/utils/FileUtils.js';
import { fbImplementPage, fbImplementOne } from './core.js';


/**
 * 下载指定 施工单位 的， 实施改造阶段的图片（改造前、改造后、环境情况）
 * @param {*} implementRenovationUnit 
 * @param {*} limit 
 */
export async function processImplementImages(implementRenovationUnit, limit=1) {

    let implementListResp = await fbImplementPage(implementRenovationUnit, limit)
    implementListResp = encryptUtil.aesDecrypt(implementListResp.data.encryption)
    implementListResp = JSON.parse(implementListResp);
    let implementList = implementListResp.data.records;
    // console.log(implementList.length)

    const queue = new PQueue({ concurrency: 1 });

    for(let i=0; i<implementList.length; i++){
        // console.log(">>",  implementList[i])
        let id = implementList[i].implementId;
        let idCard = implementList[i].idCard;
        let subprojectId = implementList[i].subprojectId;
        
        queue.add(async () => {
            let implementDetailResp = await fbImplementOne(id, idCard, subprojectId);
            implementDetailResp = encryptUtil.aesDecrypt(implementDetailResp.data.encryption)
            implementDetailResp = JSON.parse(implementDetailResp);
            let implementDetail = implementDetailResp.data;
            // console.log(implementDetail)
            downloadImplementImages(implementDetail)
          });

    }
}

async function downloadImplementImages(implementDetail){

    let srvObjName = implementDetail.name || implementDetail.omBusinessServiceObject.name;
    let srvObjIdCard =  implementDetail.idCard || implementDetail.omBusinessServiceObject.idCard;

    let crProvinceName =  implementDetail.omBusinessServiceObject.crProvinceName;
    let crCityName =  implementDetail.omBusinessServiceObject.crCityName;
    let crAreaName =  implementDetail.omBusinessServiceObject.crAreaName;
    let crStreetName =  implementDetail.omBusinessServiceObject.crStreetName;
    let crCommunityName =  implementDetail.omBusinessServiceObject.crCommunityName;

    let pathName = crProvinceName + '/' + crAreaName + '/' + crStreetName + '/' + crCommunityName + '/' + srvObjIdCard + '(' + srvObjName + ')';
    // let pathName =  srvObjIdCard + '(' + srvObjName + ')';
    let path = './' + pathName;
    fs.mkdirSync(path, { recursive: true });
    fs.mkdirSync(path + "/改造前");
    fs.mkdirSync(path + "/改造后");
    fs.mkdirSync(path + "/环境情况");

    // 下载改造前后照片
    let fbImplementProductsList = implementDetail.fbImplementProductsList;
    for(let i=0; i<fbImplementProductsList.length; i++){
        let transformingProductsName = fbImplementProductsList[i].transformingProductsName;
        let beforeImgs = fbImplementProductsList[i].beforeImgs;
        let afterImgs = fbImplementProductsList[i].afterImgs;

        downloadFiles(beforeImgs, path + "/改造前/" + transformingProductsName)
        downloadFiles(afterImgs, path + "/改造后/" + transformingProductsName)
        
    }

    // 下载环境情况照片
    let fbImplementAnswerList = implementDetail.fbImplementAnswerList;
    for(let i=0; i<fbImplementAnswerList.length; i++){
        let itemTitle = fbImplementAnswerList[i].itemTitle;
        let url = fbImplementAnswerList[i].content;

        downloadFiles(url, path + "/环境情况/" + itemTitle)
    }

    // zipFolderWithAdm(path, pathName + ".zip")
}


