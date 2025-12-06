import fs from 'fs';
import axios from 'axios';
import AdmZip from 'adm-zip';
import path from 'path';


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
    if(url.indexOf("http:")!==0){
      url = baseUrl + url;
    }

    const writer = fs.createWriteStream(dest);
    
    const request = axios.create({baseURL: url});
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