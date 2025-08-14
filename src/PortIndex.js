#!/usr/bin/env node

/**
 * Proto自动生成编号
 **/

var name = "ProtoIndex";
var des = "Proto自动生成编号";
var exampleIn = ""
+ "message msg {\n"
+ "    repeated string result = 1;\n"
+ "    repeated string a = 1;\n"
+ "\n"
+ "    // 这里是注释\n"
+ "    string b = 1;\n"
+ "    \n"
+ "    // repeated string d = 1; // 注释里的注释\n"
+ "\n"
+ "    repeated uint32 c = 1;\n"
+ "}\n";


function convert(input) {
    var res =indexProto(input);
    return res;
}



/***********************************************************
 * proto定义自动编号
 */
function testProtoIndex(s) {
    return /^[\s]*\w+(\s+[\w.]+)*\s*=\s*([\d]+)/.test(s);
}

function testProtoMessageStart(s) {
    return /^\s*message\s*/.test(s);
}


function replaceProtoIndex(s, index) {
    return s.replace(/\s*=\s*([\d]+)/, function (str, key) {
        return " = " + index;
    });
}

function indexProto(content) {
    var resContent = "";
    var s = content;

    var count = 1;
    var sList;
    if (Array.isArray(content)) {
        sList = content;
    } else {
        sList = s.split("\n");
    }
    var rItems = [];
    for (var i = 0; i < sList.length; i++) {
        var kw = sList[i];
        if (!kw) {
            rItems.push("");
            continue;
        }
        if (testProtoIndex(kw)) {
            kw = replaceProtoIndex(kw, count);
            count++;
        } else if (testProtoMessageStart(kw)) {
            count = 1;
        }
        rItems.push(kw);
    }

    resContent = rItems.join("\n")
    return resContent;
}




/*
 * 公共函数
 */


// 复制对象
function extend(to, from) {
    var keys = Object.keys(from);
    var i = keys.length;
    while (i--) {
        to[keys[i]] = from[keys[i]];
    }
    return to;
}


function nano(template, data) {
    return template.replace(/\{\{([\w\.]*)\}\}/g, function (str, key) {
        var keys = key.split("."),
            v = data[keys.shift()];
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
        return (typeof v !== "undefined" && v !== null) ? v : "";
    });
}


node_main();

console.log("xxxxxxxfsdf")

function node_main(){
  // 如果不是通过node执行，直接返回
  if("undefined" == typeof process){
    return;
  }

  if(process.argv.length <= 2){
    var s = convert(exampleIn, 'no-file-name');
    console.log(s);
    return;
  }

  for(var i=2;i<process.argv.length;i++){
    var tmpFname = process.argv[i];
    console.log(tmpFname);

    var fs = require('fs');
    if(!fs.existsSync(tmpFname)){
        console.log("file not exists");
        continue;
    }

    var str = fs.readFileSync(tmpFname, null);
    var s = convert(str.toString());
    console.log(s);
  }
}