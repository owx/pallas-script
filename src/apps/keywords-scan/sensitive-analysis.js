#!/usr/bin/env node
import fs from 'fs';
import readline from 'readline';

export function parseStaticPage(content){

    let phoneRegex = /(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}/g;
    let urlRegex = /http?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*/i;
    let idCardRegex = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
    let passwordRegex =/password/g;

    let matches = content.match(phoneRegex);
    if(matches){
        console.log(matches)
    }
}

async function readFileByLine(filePath) {
    const fileStream = fs.createReadStream(filePath, 'utf-8');
    
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity // 识别所有换行符
    });
  
    const lines = [];
    
    for await (const line of rl) {
      lines.push(line);
        parseStaticPage(line)
    }
  
    console.log('总行数:', lines.length);
    return lines;
}

export function main(){
    readFileByLine("E:\\aplid\\ningxiang-datav\\src\\views\\aplid\\MapMain\\map.vue")
}