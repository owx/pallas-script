#!/usr/bin/env node
const minimist = require('minimist');
const sast = require('./sast')
const utils = require('./utils')


const args = minimist(process.argv.slice(2));
// console.log('命令行参数:', args);

if (args.help) {

    console.log("ast -[args]");
    console.log("args -[help|version|d]");
    console.log("--help: show help info");
    console.log("--version: show version");
    console.log("-b: scan path");

} else if (args.version) {

    console.log("ast v1.0.0");

} else if (args.f) {

    let filePath=args.f;
    // console.log(filePath)
    sast.jsFileReadLine(filePath, (line, content)=>{
        
        // console.log(content);
        let phoneRegex = /(?<![0-9]+)(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}(?![0-9+])/g
        // let idCardRegex = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/g
        let idCardRegex = /(?<![0-9]+)[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2]\d)|3[0-1])\d{3}[0-9Xx](?![0-9+])/g


        let matches = content.match(idCardRegex);
        if(matches!=null){
            console.log(content)
            console.log(matches);
        }

    });

} else if (args.p) {

    let dir=args.p;
    let fileList = utils.traverseFolder(dir);
    for (var i = 0; i < fileList.length; i++) {
        console.log(fileList[i])
    }

} else {

    sast.processJsFileInPath(".")

}

