#!/usr/bin/env node
import  { logger } from '#utils/logger.js';
import PQueue from 'p-queue';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';


export async function parseHtml(dataFile, startLine=0, thread=1) {
    const queue = new PQueue({
      concurrency: thread
    });
  
    const data = fs.readFileSync(dataFile, 'utf8');
    const $ = cheerio.load(data);

    console.log($.html());

    // let list = data.split('\n');
    
    // for(let i=startLine; i<list.length; i++){
    //   let arr = list[i];
    //   let idCard =arr.trim();
    //   let name = prefixName + i;

      
    //   //   logger.error(name + ',' +  idCard);
    //   queue.add(async () => {
    //     // 
    //   });
    // }

}
  