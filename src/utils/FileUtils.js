import fs from 'fs';
import { access, constants } from 'fs/promises';
import axios from 'axios';
import AdmZip from 'adm-zip';
import path from 'path';
import { pipeline } from 'stream/promises';


/**
 * 同步写入文件带bom头
 * @param {*} path 
 * @param {*} content 
 */
export function writeFileWithBOM(path, content){
    const bom = Buffer.from('\uFEFF');
    const contentBuffer = Buffer.from(content, 'utf8');
    const buffer = Buffer.concat([bom, contentBuffer]);
    fs.writeFileSync(path, buffer);

}

/**
 * 判断文件是否存在
 * @param {*} filePath 
 * @returns 
 */
export async function fileExists(filePath) {
  return fs.existsSync(fullPath);
  // try {
  //   await access(filePath, constants.F_OK);
  //   return true;
  // } catch {
  //   return false;
  // }
}


export async function downloadFiles(urlsStr, prefix) {
    console.log(prefix + ":" + urlsStr);
    if(!urlsStr){
      return;
    }
  
    let urls = [];
    if(urlsStr.indexOf(',')>0){
      urls= urlsStr.split(',');
      // urls = urls.map(item => baseUrl + item);
    }else{
      urls.push(urlsStr);
    }
  
    // console.log(urls)
  
    for(let i=0; i<urls.length; i++){
      let url = urls[i];
      console.log("downloading:" + url)
      await downloadFile(url, prefix + "_"+ (i+1) + '.jpeg')
    }
}

export async function downloadFile(url, dest) {
    const baseUrl = "https://chifeng-nx.njapld.com:7979";
    const fullUrl = url.indexOf("http") === 0 ? url : baseUrl + url;
    
    try {
        // 1. 进行下载请求
        const response = await axios({
            method: 'get',
            url: fullUrl,
            responseType: 'stream'
        });

        // 2. 文件路径不存在，则进行创建
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // 3. 下载内容保存到文件
        const writer = fs.createWriteStream(dest);
        await pipeline(response.data, writer);
        // console.log(`文件下载成功: ${dest}`);
    } catch (error) {
        // console.error(`下载失败: ${fullUrl}`, error.message);
        throw error;
    }
  
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