#!/usr/bin/env node
import { mrMain } from "./radar/index.js";
import { wcMain } from "./miwi-watch/index.js";
import { omMain } from "./om-switch/index.js";
import { otoMain } from "./oneteno/index.js";


export async function hwMain(mode, page, size, total, file, output) {
  switch(mode){
    case 'mr':
      console.log(`开始监听毫米波雷达MQTT消息`);
      mrMain();
      break;
        
    case 'wc':
      console.log(`开始运行智能腕表工具`);
      wcMain();
      break;

    case 'om':
      console.log(`开启进行OM交换机录音文件同步服务`);
      omMain()
      break;

    case 'oto':
      console.log(`开启Oneteno毫米波雷达服务`);
      otoMain();
      break;

    default:
      console.log("xbox hw -m(mode)")
      console.log("\t-m mr : 毫米波雷达MQTT消息分析工具")
      console.log("\t-m wc : MIWI智能腕表API接口工具")
      console.log("\t-m om : OM交换机录音文件同步工具")
      console.log("\t-m oto : Oneteno毫米波雷达工具")
      break;
  }
}
