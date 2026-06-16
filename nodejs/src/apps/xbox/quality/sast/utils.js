#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';


// export function traverseFolder(directory, extension){

//     if( directory == undefined ){
//         directory='.';
//     }

//     let fileList = [];
//     fs.readdirSync(directory).forEach(file => {

//         let fullPath = path.join(directory, file);
//         let stat = fs.lstatSync(fullPath);

//         if (stat.isDirectory()) {

//         let subFileList = traverseFolder(fullPath, extension); // 递归子目录
//         fileList = fileList.concat(subFileList);

//         } else if (path.extname(fullPath) === `.${extension}`) {

//         fileList.push(fullPath);

//         } else if(extension == undefined){

//         fileList.push(fullPath);

//         }
//     });

//     return fileList;

// };



/**
 * 异步递归遍历目录
 */
export async function traverseDirectory(dirPath) {
  let results = [];
  try {
    const list = await fs.readdir(dirPath);

    for (const item of list) {
      const fullPath = path.join(dirPath, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        const subDirResults = await traverseDirectory(fullPath);
        results = results.concat(subDirResults);
      } else {
        results.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`遍历目录 ${dirPath} 时出错:`, error);
  }
  return results;
}


// 定义文件类型映射
export const FILE_TYPES = {
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
  DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.md', '.xlsx', '.pptx'],
  CODE: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.html', '.css', '.scss', '.json', '.xml', '.vue'],
  ARCHIVES: ['.zip', '.rar', '.7z', '.tar', '.gz'],
  MEDIA: ['.mp4', '.avi', '.mov', '.mp3', '.wav', '.flac']
};


// 通用的筛选函数
export function filterFilesByExtension(files, extensions) {
  return files.filter(file => 
      extensions.includes(path.extname(file).toLowerCase())
  );
}
