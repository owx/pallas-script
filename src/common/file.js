import fs from 'fs';

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