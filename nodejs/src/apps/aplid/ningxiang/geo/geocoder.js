#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import PQueue from 'p-queue';
import { axiosManager } from '#utils/AxiosManager.js';
import { encryptUtil } from '#utils/EncryptUtil.ts'
import { logger } from '#src/utils/LoggerUtils.js'

// const authorization = 'Bearer f4fdbf6c-b9d2-4536-a4b9-e197618b8e7e';
const request = axiosManager.createInstance("geo", {
  baseURL: "http://api.tianditu.gov.cn",
  timeout: 60000,
  // headers: {
  //   Authorization: authorization,
  // }
})

/**
 * 天地图-地址转经纬度
 * http://lbs.tianditu.gov.cn/server/geocodinginterface.html
 * @param {*} name 
 * @param {*} idCard 
 * @returns 
 */
async function geocoder(keyWord, tk='3205ac21b30c56e3d678f52655f119f5'){
  const url = "/geocoder";

  let params = {
    ds: `{"keyWord":${keyWord}}`,
    tk: tk,
  }

  return request.get(url, {params: params});
}

const queue = new PQueue({
  concurrency: 1,
  interval: 1000,
  intervalCap: 350,
 });


/**
 * 批量地址转成经纬度
 * 
 * @param {*} srcFile 
 * @param {*} startLine 
 * @param {*} limit 
 */
export async function batchQueryGeo(srcFile, startLine=0, limit=1) {

    // 创建可写流
    const fsws = fs.createWriteStream(srcFile + '_result.txt', {
      encoding: 'utf8',
      flags: 'w' // 'w' 写入, 'a' 追加
    });

    // 监听事件
    fsws.on('open', () => {
      console.log('文件流已打开');
    });
  
    fsws.on('ready', () => {
      console.log('文件流已准备就绪');
    });
  
    fsws.on('finish', () => {
      console.log('所有数据已写入');
    });
  
    fsws.on('error', (err) => {
      console.error('流写入错误:', err);
    });

    const data = fs.readFileSync(srcFile, 'utf8');
    let list = data.split('\n');

    for(let i=startLine; i<startLine+limit; i++){
      const lineData = list[i];

      // 1. 空行直接跳过
      if(lineData ==null || lineData.length==0 || lineData ==""){
        continue;
      }

      // 2. 已有经纬度的记录跳过
      const row = lineData.split('\t');
      if(row.length==5){
        fsws.write(lineData + '\n');
        console.log( i, lineData)
        continue;
      }

      let idCard =row[0].substring(1, row[0].length-1);
      let name = row[1].substring(1, row[1].length-1);;
      let address = row[2].substring(1, row[2].length-1);
      console.log( i, idCard, name, address)

      // 3. 地址空直接跳过
      if(address==null || address.length==0 || address =="" || address=='""'){
        fsws.write(lineData + '\n');
        continue;
      }

      // 4. 查询经纬度
      queue.add(async () => {
        geocoder("南京市" + address).then((resp)=>{
          let lon = resp.data.location.lon;
          let lat = resp.data.location.lat;
          const rowData = `"${idCard}"\t"${name}"\t"${address}"\t"${lon}"\t"${lat}"`;
          fsws.write(rowData + '\n');
          logger.info(`${i}, ${idCard}, ${name}, ${JSON.stringify(resp.data)}`);
        }).catch((reason)=>{
          const rowData = `"${idCard}"\t"${name}"\t"${address}"`;
          fsws.write(rowData + '\n');
          logger.error(`${i}, ${idCard}, ${name} - 异常: ${JSON.stringify(reason)}`);
        }).finally(()=>{
          //
        })
      });
    }

    // writeFileWithBOM('./death.xls', content);

}

/**
 * 批量地址转成经纬度
 * 
 * @param {*} srcFile 
 * @param {*} startLine 
 * @param {*} limit 
 */
export async function batchQueryOrgGeo(srcFile, startLine=0, limit=1) {

  // 创建可写流
  const fsws = fs.createWriteStream(srcFile + '_result.txt', {
    encoding: 'utf8',
    flags: 'w' // 'w' 写入, 'a' 追加
  });

  // 监听事件
  fsws.on('open', () => {
    console.log('文件流已打开');
  });

  fsws.on('ready', () => {
    console.log('文件流已准备就绪');
  });

  fsws.on('finish', () => {
    console.log('所有数据已写入');
  });

  fsws.on('error', (err) => {
    console.error('流写入错误:', err);
  });

  const data = fs.readFileSync(srcFile, 'utf8');
  let list = data.split('\n');

  for(let i=startLine; i<list.length; i++){
    const lineData = list[i];
    const row = lineData.split('\t');

    let idCard =row[0].substring(1, row[0].length-1);
    let name = row[0].substring(1, row[0].length-1);
    let address = row[6].substring(1, row[6].length-2);

    console.log( i, idCard, name, address)

    if(address.length<5){
      logger.error(`${idCard}, ${name}, 地址为空`);
    }else{
      queue.add(async () => {
        geocoder(address).then((resp)=>{
          let lon = resp.data.location.lon;
          let lat = resp.data.location.lat;
          const rowData = `"${idCard}"\t"${lon}"\t"${lat}"`;
          logger.info(`${i}, ${idCard}, ${name}, ${JSON.stringify(resp.data)}`);
          fsws.write(rowData + '\n');
        })
      });
    }

  }
  // writeFileWithBOM('./death.xls', content);
}
  


/**
 * 数据预处理
 */
export function preProcessData(){

    // 1. 读取文件
    const srcFilePath = 'result(100w+).txt';
    const destFilePath = 'dest.txt';
    const content = fs.readFileSync(srcFilePath, 'utf8');

    // 2. 按行分割，并过滤掉偶数行
    const lines = content.split('\n');
    // const filteredLines = lines.filter((line, index) => {
    // //   return !((line[0] === ',') || line.indexOf(',0,')>0 );     // 失败和死亡的数据
    // // return !((line[0] === ',') || line.indexOf('成功')>0 );      // 执行成功的数据
    // // return line.indexOf('失败')>0 ;                                 // 执行失败的数据
    // // return line.indexOf(',2,')>0 ;                                 // 确认死亡的数据
    //   return line.indexOf('')>0 ;
    // //   return line.indexOf(',0,')>2;  //死亡的数据
    // });

    // 3. 数据进行处理
    const newLines = lines.map((line, index) => {
      if(line==null || line==""){
        return;
      }
      const row = line.split('\t');
      // if(row.length < 8){
      //   return;
      // }

      console.log(row);

      let idCard =row[0].substring(1, row[0].length-1);
      let name = row[1].substring(1, row[1].length-0);
      let address = row[2].substring(1, row[2].length-1);
      let lon = row[3]?.substring(1, row[3]?.length-1);
      let lat = row[4]?.substring(1, row[4]?.length-1);

      if(address=="" || address=='""' || lon ==null || lat ==null ){
        return `"${idCard}"\t"${name}"\t"${address}"`;
      }else{
        return `"${idCard}"\t"${name}"\t"${address}"\t"${lon}"\t"${lat}"`;
      }

    });
        
    // 3. 重新合并并写入文件
    const newContent = newLines.join('\n');
    fs.writeFileSync(destFilePath, newContent, 'utf8');

    console.log('数据处理完成！');
}