#!/usr/bin/env node
import { Command } from 'commander';
import { mrMain } from "./radar/index.js";
import { wcMain } from "./miwi-watch/index.js";
import { omMain } from "./om-switch/index.js";


const program = new Command();

program
  .name('hw')
  .description('Hardware Device Management CLI Tools')
  .version('1.0.0');

program
  .command('mr')
  .description('毫米波雷达MQTT消息分析工具')
  // .option('-p, --port <number>', '端口号', '3000')
  // .option('-h, --host <string>', '主机名', 'localhost')
  .action((options) => {
    console.log(`开始监听毫米波雷达MQTT消息`);
    mrMain();
  });

program
  .command('wc')
  .description('MIWI智能腕表API接口工具')
  // .option('-o, --output <dir>', '输出目录', 'dist')
  // .option('--minify', '是否压缩')
  .action((options) => {
    console.log(`开始运行智能腕表工具`);
    // if (options.minify) {
    //   console.log('启用压缩');
    // }
    // 执行构建逻辑
    wcMain();
  });

program
  .command('om')
  .description('OM交换机录音文件同步工具')
  // .option('-o, --output <dir>', '输出目录', 'dist')
  // .option('--minify', '是否压缩')
  .action((options) => {
    console.log(`开启进行OM交换机录音文件同步服务`);
    // if (options.minify) {
    //   console.log('启用压缩');
    // }
    // 执行构建逻辑
    omMain();
  });

program.parse();