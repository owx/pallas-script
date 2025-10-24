#!/usr/bin/env node
import fs from 'fs';
import { downloadFiles, zipFolderWithAdm, getEnvAssessList, getEnvAssessDetail, decryptData } from "./core.js";

export async function main(params) {

    let envAssessListResp = await getEnvAssessList("1960238435465662466", 10)
    envAssessListResp = await decryptData(envAssessListResp.data.encryption)
    let envAssessList = envAssessListResp.data.records;
    console.log(envAssessList.length)
    for(let i=0; i<envAssessList.length; i++){
        // console.log(">>",  envAssessList[i])
        downloadAssessImages(envAssessList[i])
    }

    // let envAssesDetailResp = await getEnvAssessDetail();
    // envAssesDetailResp = await decryptData(envAssesDetailResp.data.encryption)
    // let envAssesDetail = envAssesDetailResp.data;
    // // console.log(envAssesDetail)
    // downloadAssessImages(envAssesDetail)

}

async function downloadAssessImages(envAssessDetail){

    let srvObjName = envAssessDetail.name || envAssessDetail.omBusinessServiceObject.name;
    let srvObjIdCard =  envAssessDetail.idCard || envAssessDetail.omBusinessServiceObject.idCard;

    let pathName =  srvObjIdCard + '(' + srvObjName + ')';
    let path = './' + pathName;

    fs.mkdirSync(path);

    // https://chifeng-nx.njapld.com:7979/chifeng-nx/ningxiang%2F0b6f176df49e3263c11009e38952342c250923171414.jpeg

    let serviceObjectPhotoUrls = envAssessDetail.serviceObjectPhoto;
    await downloadFiles(serviceObjectPhotoUrls,  path + "/老年人本人照片");

    let householdPhotoUrls = envAssessDetail.householdPhoto;
    await downloadFiles(householdPhotoUrls, path + "/身份证、户口本照片");

    let doorPhotoUrls = envAssessDetail.doorPhoto;
    await downloadFiles(doorPhotoUrls, path + "/门头照片");

    let livingPhotoUrls = envAssessDetail.livingPhoto;
    await downloadFiles(livingPhotoUrls, path + "/客厅照片");

    let bedRoomPhotoUrls = envAssessDetail.bedRoomPhoto;
    await downloadFiles(bedRoomPhotoUrls, path + "/卧室照片");

    let kitchenPhotoUrls = envAssessDetail.kitchenPhoto;
    await downloadFiles(kitchenPhotoUrls, path + "/厨房照片");

    let toiletPhotoUrls = envAssessDetail.toiletPhoto;
    await downloadFiles(toiletPhotoUrls, path + "/卫生间照片");

    let bathroomPhotoUrls = envAssessDetail.bathroomPhoto;
    await downloadFiles(bathroomPhotoUrls, path + "/洗澡间照片");

    let otherPhotoUrls = envAssessDetail.otherPhoto;
    await downloadFiles(otherPhotoUrls, path + "/其他照片");

    zipFolderWithAdm(path, pathName + ".zip")
}


