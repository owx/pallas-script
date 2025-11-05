#!/usr/bin/env node
import axios from 'axios';
import fs from 'fs';
import { encryptUtil } from '../../../common/EncryptUtil.ts'
import  { logger } from '../../../common/logger.js';
// import { writeFileWithBOM } from '../../common/file.js';
import PQueue from 'p-queue';


let Authorization = 'Bearer b3a63e5c-3607-4c57-84f0-aa991ab10d73';
axios.interceptors.request.use(config => {
  config.headers['Authorization'] = Authorization;
  return config;
});


/**
 * 宁享-多元死亡数据查询
 * 环境：线上
 * 
 * @param {*} name 
 * @param {*} idCard 
 * @returns 
 */
function queryDeathInfo(name, idCard){
    let data = {
      "name": name,
      "idCard": idCard
    }
  
    return axios.post('http://180.101.239.5:11762/bussiness/dpDeathQueryRecords/query', data);
}


async function queryDeath(queue, name, idCard, count=0){
  count++;
  let rowData = '';
  await queryDeathInfo(name, idCard).then((resp)=>{

    let jsonData = resp.data;
    // logger.info(name + ',' +  idCard + ', 成功, ' + JSON.stringify(jsonData) );
    let decryptData = encryptUtil.decrypt(jsonData, Authorization)
    // logger.info(name + ',' +  idCard + ', 成功, ' + decryptData );

    let response = JSON.parse(decryptData);
    let data = response.data;
    if(response.code === 0){
      rowData = idCard + ', 成功, ' + data.id + ',' + data.zxbs + ',' + name + ',' +   data.deathdate;
    }else{
      rowData = idCard + ', 失败, ' + data.id + ',' + data.zxbs + ',' +  name + ',' +   data.deathdate;
    }
    logger.info( rowData + ',' + decryptData);
  }).catch((err)=>{

    if(count>10){
      rowData = name + ',' +  idCard + ', 失败-异常';
      logger.error(name + ',' +  idCard + ', 异常10次, ' + err);
    }else{
      logger.error(name + ',' +  idCard + ', 异常重试' + count + '次, ' + err);
      queue.add(async ()=>{
        queryDeath(queue, name, idCard, count)
      })
    }

  }).finally(()=>{
    // content += rowData;
  })
}

/**
 * 宁享-批量查询多元死亡数据
 * 
 * @param {*} idCardFile 
 * @param {*} prefixName 
 * @param {*} startLine 
 * @param {*} thread 
 */
export async function batchQueryDeath(idCardFile, prefixName, startLine=0, thread=1) {
    
    const data = fs.readFileSync(idCardFile, 'utf8');
    const queue = new PQueue({ concurrency: thread });

    let list = data.split('\n');

    for(let i=startLine; i<list.length; i++){
      let arr = list[i];
      let idCard =arr.trim();
      let name = prefixName + i;

      //   logger.error(name + ',' +  idCard);
      queue.add(async () => {
        queryDeath(queue, name, idCard);
      });
    }

    // writeFileWithBOM('./death.xls', content);

}
  
  
/**
 * 宁享-批量查询多元死亡数据
 * 
 * @param {*} idCardFile 
 * @param {*} prefixName 
 * @param {*} startLine 
 * @param {*} thread 
 */
export async function batchQueryDeathData(idCardFile, prefixName, startLine=0, thread=1) {

    //  await fs.readFile('./oldman.txt', 'utf8', (err, data) => {
    //     if (err) {
    //       console.error('读取失败:', err);
    //       return;
    //     }
    //   });

    // 创建可写流
    const fsws = fs.createWriteStream('dest.txt', {
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

    
    const data = fs.readFileSync(idCardFile, 'utf8');
    const queue = new PQueue({ concurrency: thread });

    let list = data.split('\n');
    let content = "";
    for(let i=startLine; i<list.length; i++){
      let arr = list[i];
      let idCard =arr.trim();
      let name = prefixName + i;

      logger.error(name + ',' +  idCard);
      queue.add(async () => {
        let rowData = '';
        await queryDeathInfo(name, idCard).then((resp)=>{
          
          let jsonData = resp.data;
          // logger.info(name + ',' +  idCard + ', 成功, ' + JSON.stringify(jsonData) );
          let decryptData = encryptUtil.decrypt(jsonData, Authorization)
          // logger.info(name + ',' +  idCard + ', 成功, ' + decryptData );

          let response = JSON.parse(decryptData);
          logger.info(response);

          let data = response.data;
          if(response.code === 0){
            rowData = idCard + ',' +  name + ',成功, ' + data.id + ',' + data.zxbs + ',' +   data.deathdate + ',' +   data.swrq;
          }else{
            rowData = idCard + ',' +  name + ',失败, ' + data.id + ',' + data.zxbs + ',' +   data.deathdate + ',' +   data.swrq;
          }
          logger.info( rowData + ',' + decryptData);
        }).catch((err)=>{

          rowData = idCard + ', ' +  name + ',异常';
          logger.error(idCard + ',' + name + ',异常,' + err);

        }).finally(()=>{

          fsws.write(rowData + '\n');
          // content += rowData;

        })
      }
      );
    }

  }
  

export function processData(){
    // 1. 读取文件
    const srcFilePath = 'src.txt';
    const destFilePath = 'dest.txt';

    const content = fs.readFileSync(srcFilePath, 'utf8');

    // 2. 按行分割，并过滤掉偶数行
    const lines = content.split('\n');
    const filteredLines = lines.filter((line, index) => {
    //   return !((line[0] === ',') || line.indexOf(',0,')>0 );     // 失败和死亡的数据
    // return !((line[0] === ',') || line.indexOf('成功')>0 );      // 执行成功的数据
    // return line.indexOf('失败')>0 ;                                 // 执行失败的数据
    // return line.indexOf(',2,')>0 ;                                 // 确认死亡的数据
      return line.indexOf('')>0 ;


    //   return line.indexOf(',0,')>2;  //死亡的数据

    });

    const newLines = lines.map((line, index) => {
        let json = JSON.parse(line);
        let data = json.data;

        if(data.zxbs == null || data.zxbs == '1' ){
            return undefined;
        }


        return  data.idCard + ',' + data.zxbs + ',' + data.swrq;

        // return line.substring(line.indexOf(',{') + 1);
    });
        

    // 3. 重新合并并写入文件
    const newContent = newLines.join('\n');
    fs.writeFileSync(destFilePath, newContent, 'utf8');

    console.log('隔行删除完成！');
}