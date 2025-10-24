#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import request from './request.js';
import CryptoJS from "crypto-js";

export async function decryptData(data){
  const key = CryptoJS.enc.Utf8.parse('j#vcZgVXusQ6MQQS');        
  let decryptData = CryptoJS.AES.decrypt(data, key, {
      iv: key,
      mode: CryptoJS.mode.CFB,
      padding: CryptoJS.pad.NoPadding
  }).toString(CryptoJS.enc.Utf8);
  let destJson = JSON.parse(decryptData);

  return destJson;
}


export async function getEnvAssessList(subprojectId='1930932494178140162', size=1, envAssessmentApprovalStatus=3) {
  let url = '/management/fbEnvAssessment/page';

  let body ={
    "current": 1,
    "size": size,
    "isCancel": 0,
    "envAssessmentApprovalStatus": envAssessmentApprovalStatus,
    "subprojectId": subprojectId,
    "isTrusted": true,
    // "_vts": 1759043023658,
    "pageParaPO": {
      "current": 1,
      "size": size
    }
  }

  return request.post(url, body);
}


export async function getEnvAssessDetail(idCard='710000190611051585', subprojectId='1930932494178140162') {
    let url = '/management/fbEnvAssessment/one';

    let body = {
        idCard: idCard,
        subprojectId: subprojectId,
    }
  
    return request.post(url, body);
}


export async function downloadFiles(urlsStr, prefix) {
  console.log(prefix + ":" + urlsStr);
  if(!urlsStr){
    return;
  }

  let urls = [];
  if(urlsStr.indexOf(',')>0){
    urls= urlsStr.split(',');
  }else{
    urls.push(urlsStr);
  }

  // console.log(urls)

  for(let i=0; i<urls.length; i++){
    let url = urls[i];
    console.log("downloading:" + url)
    await downloadFile(url, prefix + "_image_"+ i + '.jpeg')
  }
}


export async function downloadFile(url, dest) {
    const writer = fs.createWriteStream(dest);
    
    const response = await request({
      method: 'get',
      url: url,
      responseType: 'stream'
    });
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  
}

export async function zipFolderWithAdm(sourceDir, outputPath) {
    const zip = new AdmZip();
    
    function addFolderToZip(folderPath, zipPath = '') {
      const items = fs.readdirSync(folderPath);
      
      items.forEach(item => {
        const fullPath = path.join(folderPath, item);
        const relativePath = path.join(zipPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          addFolderToZip(fullPath, relativePath);
        } else {
          zip.addLocalFile(fullPath, zipPath);
        }
      });
    }
    
    addFolderToZip(sourceDir);
    zip.writeZip(outputPath);
  }