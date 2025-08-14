#!/usr/bin/env node
const fs = require('fs');
const beautify = require('js-beautify');
const Excel = require('exceljs');
const utils = require('./utils')


exports.jsFileReadLine = function(filePath, handleLineCallback){

    try{
        const data = fs.readFileSync(filePath, 'utf8');
        const beautifiedCode = beautify(data, {

            indent_size: 4, // 缩进大小
            space_in_empty_paren: true // 在空括号内是否加空格

        });

        let arr = beautifiedCode.split('\n');
        for (let i=0; i<arr.length; i++) {

            if(handleLineCallback!=undefined){

                let content = arr[i].trim();
                handleLineCallback(i+1, content);

            }
        }

    } catch (err) {
        console.error(err);
    }

}


exports.processJsFileInPath = function(directory){

    // 创建一个新的工作簿
    let workbook = new Excel.Workbook();

    let columns = [
        { header: '文件', key: 'file' },
        { header: '行数', key: 'line' },
        { header: '位置', key: 'pos' },
        { header: '内容', key: 'content' },
        { header: '关键字', key: 'keyword' },
        { header: '风险问题', key: 'risk' },
        { header: '解决方案', key: 'result' },
    ];

    let passwordSheet = workbook.addWorksheet('password');
    passwordSheet.columns = columns;

    let pwdSheet = workbook.addWorksheet('pwd');
    pwdSheet.columns = columns;

    let secrectSheet = workbook.addWorksheet('secret');
    secrectSheet.columns = columns;

    // let secretKeySheet = workbook.addWorksheet('secretKey');
    // secretKeySheet.columns = columns;

    let phoneKeySheet = workbook.addWorksheet('Phone');
    phoneKeySheet.columns = columns;

    let idCardKeySheet = workbook.addWorksheet('IdCard');
    idCardKeySheet.columns = columns;

    let fileList = utils.traverseFolder(directory, "js");
    let phoneRegex = /(?<![0-9]+)(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}(?![0-9+])/g;
    // let idCardRegex = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
    let idCardRegex = /(?<![0-9]+)[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2]\d)|3[0-1])\d{3}[0-9Xx](?![0-9+])/g

    for (var i = 0; i < fileList.length; i++) {
        // console.log(fileList[i])

        let pos = -1;
        let matches;
        exports.jsFileReadLine(fileList[i], (line, content)=>{
            // console.log( "Line:" + line + " >" + content)

            //搜索 password 关键字
            pos = content.indexOf("password")
            if(pos>=0){
                // console.log( "Line:" + line + ", pos:" + pos + " >" + content)
                passwordSheet.addRow({ file: fileList[i], line: line, pos: pos,  content: content, keyword: 'password'});
            }

            //搜索 pwd 关键字
            pos = content.indexOf("pwd")
            if(pos>=0){
                // console.log( "Line:" + line + ", pos:" + pos + " >" + content)
                pwdSheet.addRow({ file: fileList[i], line: line, pos: pos,  content: content, keyword: 'pwd'});
            }

            //搜索 secret 关键字
            pos = content.indexOf("secret")
            if(pos>=0){
                // console.log( "Line:" + line + ", pos:" + pos + " >" + content)
                secrectSheet.addRow({ file: fileList[i], line: line, pos: pos,  content: content, keyword: 'secret'});
            }

            //搜索 电话号码
            matches = content.match(phoneRegex);
            if(matches!=null){
                // console.log(content)
                // console.log(matches);
                phoneKeySheet.addRow({ file: fileList[i], line: line, pos: "",  content: content, keyword: matches});
            }

            //搜索 身份证号码
            matches = content.match(idCardRegex);
            if(matches!=null){
                // console.log(content)
                // console.log(matches);
                idCardKeySheet.addRow({ file: fileList[i], line: line, pos: "",  content: content, keyword: matches});
            }

        })

    }

    // 写入文件
    workbook.xlsx.writeFile('sca_report.xlsx');
}

