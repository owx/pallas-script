import fs from 'fs';
import readline from 'readline';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import { traverseDirectory,  filterFilesByExtension, FILE_TYPES } from './utils.js';

export async function startScan(){
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const __current = process.cwd();

    try {
        const targetDir = path.join(__current, '.');
        const allFiles = await traverseDirectory(targetDir);
        // const imageFiles = filterFilesByExtension(allFiles, FILE_TYPES.IMAGES);
        const codeFiles = filterFilesByExtension(allFiles, FILE_TYPES.CODE);

        // console.log('找到的文件:', codeFiles);

        codeFiles.map((filePath)=>{
            scanFileRisks(filePath);
        })


    } catch (error) {
        console.error('程序执行出错:', error);
    }
}


// export function parseStaticPage(content){

//     let phoneRegex = /(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}/g;
//     let urlRegex = /http?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*/i;
//     let idCardRegex = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
//     let passwordRegex =/password/g;

//     let matches = content.match(phoneRegex);
//     if(matches){
//         console.log(matches)
//     }
// }


export async function scanFileRisks(filePath){
    const fileStream = fs.createReadStream(filePath, 'utf-8');
    
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity // 识别所有换行符
    });

    let i=0;
    rl.on('line', (line) => {
        i++;
        let risks = riskAnalysis(line)
        if(risks.length>0){
            console.log( filePath +  ' (L' + i  + ') : ' + risks)
        }
    });


}


function riskAnalysis(content){
    let riskList = [];

    let phoneRegex = /(?<![0-9]+)(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}(?![0-9+])/g;
    // let idCardRegex = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
    let idCardRegex = /(?<![0-9]+)[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2]\d)|3[0-1])\d{3}[0-9Xx](?![0-9+])/g
    

    // //搜索 password 关键字
    // pos = content.indexOf("password")
    // if(pos>=0){
    //     passwordSheet.addRow({ file: fileList[i], line: line, pos: pos,  content: content, keyword: 'password'});
    // }

    // //搜索 pwd 关键字
    // pos = content.indexOf("pwd")
    // if(pos>=0){
    //     pwdSheet.addRow({ file: fileList[i], line: line, pos: pos,  content: content, keyword: 'pwd'});
    // }

    // //搜索 secret 关键字
    // pos = content.indexOf("secret")
    // if(pos>=0){
    //     secrectSheet.addRow({ file: fileList[i], line: line, pos: pos,  content: content, keyword: 'secret'});
    // }

    let matches;

    //搜索 电话号码
    matches = content.match(phoneRegex);
    if(matches!=null){
        riskList.push("手机号(" + matches + ')');
        // console.log(content)
        // console.log(matches);
        // phoneKeySheet.addRow({ file: fileList[i], line: line, pos: "",  content: content, keyword: matches});
    }

    //搜索 身份证号码
    matches = content.match(idCardRegex);
    if(matches!=null){
        riskList.push("身份证号：(" + matches + ')');

        // console.log(content)
        // console.log(matches);
        // idCardKeySheet.addRow({ file: fileList[i], line: line, pos: "",  content: content, keyword: matches});
    }

    return riskList;
}

