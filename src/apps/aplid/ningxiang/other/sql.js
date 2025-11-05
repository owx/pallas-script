#!/usr/bin/env node
import fs from 'fs';
import { writeFileWithBOM } from '../../common/file.js';
import  { logger } from '../../common/logger.js';

/**
 * 宁享-慢SQL查询分析工具
 * 
 * @param {*} dataFilePath 
 * @param {*} storeFilePath 
 */
export function parseSqlData(dataFilePath, storeFilePath) {

  try{
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    // console.log(rawData);
    let lines = rawData.split('\n');
    let csvContet = "";
    
    // const selectRegex = /^SELECT\s+[\w\*\s,]+(?:\s+FROM\s+\w+)(?:\s+WHERE\s+[\w\s=<>]+)?\s*;?$/i;

    let result = {};

    const regex = /^SELECT\s+([\w\*\s,]+)\s+FROM\s+(\w+)(?:\s+WHERE.*)?/i;
    for(let row of lines){
        if(row.indexOf("SELECT")>=0){
            // console.log(row);
            // const sql = "SELECT name, age, address FROM users WHERE age > 30 AND city = 'New York';";
            let sql = row;

            // 正则表达式提取 SELECT 语句中 WHERE 之前的部分
            const match = sql.match(regex);

            if (match) {
                const columns = match[1]; // SELECT 后的列名部分
                const table = match[2];   // 表名部分

                // console.log("Columns:", columns);
                // console.log("Table:", table);

                let name = table + "_" + columns;
                result[name] = result[name]==undefined?[]:result[name];
                result[name].push(row);

            } else {
                console.log("No match found");
            }

        }

        // console.log(obj.ahbx1502 + "," + obj.ahbx1503 + "," + obj.ahbx1601 + "," + obj.ahbx1701);
        // csvContet += obj.ahbx1502 + "," + obj.ahbx1503 + "," + obj.ahbx1601 +  "," + obj.ahbx1701 + '\n';
        // console.log(obj.ahbx1502);
        // console.log(obj.ahbx1601);
    }


    for (let key in result) {
        if (result.hasOwnProperty(key)) { // 过滤掉继承的属性
          logger.info(result[key][0]);
        }
    }

    // writeFileWithBOM(storeFilePath, JSON.stringify(result, null, 2));

  }catch(err){
    console.log(err)
  }
}

