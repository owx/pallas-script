#!/usr/bin/env node
const fs = require('fs');
const path = require('path');


exports.traverseFolder = function(directory, extension){

    if( directory == undefined ){
        directory='.';
    }

    let fileList = [];
    fs.readdirSync(directory).forEach(file => {

        let fullPath = path.join(directory, file);
        let stat = fs.lstatSync(fullPath);

        if (stat.isDirectory()) {

        let subFileList = exports.traverseFolder(fullPath, extension); // 递归子目录
        fileList = fileList.concat(subFileList);

        } else if (path.extname(fullPath) === `.${extension}`) {

        fileList.push(fullPath);

        } else if(extension == undefined){

        fileList.push(fullPath);

        }
    });

    return fileList;

};


