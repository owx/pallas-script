#!/usr/bin/env node
import axios from 'axios';
import fs from 'fs';
import  { logger } from '../../common/logger.js';
import { writeFileWithBOM } from '../../common/file.js';
import PQueue from 'p-queue';
import CryptoJS from "crypto-js";


let Authorization = 'Bearer 22a07b53-4f79-40a7-ae2f-5fbebf6b7b02';
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
  
  
/**
 * 宁享-批量查询多元死亡数据
 * 
 * @param {*} idCardFile 
 * @param {*} tag 
 * @param {*} startLine 
 * @param {*} thread 
 */
export async function batchQueryDeathData(idCardFile, tag, startLine=0, thread=1) {

    //  await fs.readFile('./oldman.txt', 'utf8', (err, data) => {
    //     if (err) {
    //       console.error('读取失败:', err);
    //       return;
    //     }
    //   });
      
      const data = fs.readFileSync(idCardFile, 'utf8');
      const queue = new PQueue({ concurrency: thread });
  
      let list = data.split('\n');
      let content = "";
      for(let i=startLine; i<list.length; i++){
        let arr = list[i];
        let idCard =arr.trim();
        let name = tag + i;
        // let name = tag;
  
        //   logger.error(name + ',' +  idCard);
        queue.add(async () => {
          let rowData = '';
          await queryDeathInfo(name, idCard)
          .then((resp)=>{
            // logger.info(name + ',' +  idCard + ', 成功, ' +  JSON.stringify(resp.data) );
            const key = CryptoJS.enc.Utf8.parse('j#vcZgVXusQ6MQQS');        
            let decrpedData = CryptoJS.AES.decrypt(resp.data.encryption, key, {
                iv: key,
                mode: CryptoJS.mode.CFB,
                padding: CryptoJS.pad.NoPadding
            }).toString(CryptoJS.enc.Utf8);

            let response = JSON.parse(decrpedData);
            let data = response.data;
            if(response.code === 0){
              rowData = idCard + ', 成功, ' + data.id + ',' + data.zxbs + ',' + name + ',' +   data.deathdate;
            }else{
              rowData = idCard + ', 失败, ' + data.id + ',' + data.zxbs + ',' +  name + ',' +   data.deathdate;
            }
            logger.info( rowData + ',' + decrpedData);
          })
          .catch((err)=>{
            rowData = name + ',' +  idCard + ', 失败-异常';
            logger.error(name + ',' +  idCard + ', 失败, ' + err);
          }).finally(()=>{
            content += rowData;
          })
        }
        );
      }

      writeFileWithBOM('./death.xls', content);

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