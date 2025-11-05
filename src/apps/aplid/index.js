#!/usr/bin/env node
import { Command } from 'commander';
import { bcMain } from './blockchain/index.js';
import { cfMain } from './chifeng/index.js';
import { mcaMain } from './mca/index.js';
import { nxMain } from './ningxiang/index.js';

const program = new Command();

program
  .name('ap')
  .description('Aplid Project Process CLI Tools')
  .version('1.0.0');

program
  .command('bc')
  .description('南京市政务云区块链服务平台工具')
  // .option('-o, --output <dir>', '输出目录', 'dist')
  // .option('--minify', '是否压缩')
  .action((options) => {
    bcMain(options.size);
  });

program
  .command('mca')
  .description('全国养老信息平台批量数据处理工具集')
  .option('-s, --size <number>', '批量处理数量', '1')
  // .option('-h, --host <string>', '主机名', 'localhost')
  .action((options) => {
    console.log(`运行MCA工具，数据处理上限配置：${options.size}`);
    mcaMain(options.size);
  });

program
  .command('nx')
  .description('宁享养老平台批量数据处理工具集')
  .option('-s, --size <number>', '批量处理数量', '1')
  // .option('-o, --output <dir>', '输出目录', 'dist')
  // .option('--minify', '是否压缩')
  .action((options) => {
    console.log(`运行NX工具，数据处理上限配置：${options.size}`);
    nxMain();
  });

program
  .command('cf')
  .description('赤峰市养老平台批量数据处理工具集')
  .option('-o, --output <dir>', '输出目录', 'dist')
  .option('--minify', '是否压缩')
  .action((options) => {
    console.log(`构建到目录: ${options.output}`);
    if (options.minify) {
      console.log('启用压缩');
    }
    // 执行构建逻辑
  });

program
  .command('ms')
  .description('5.1平台菜单同步工具')
  .option('-o, --output <dir>', '输出目录', 'dist')
  .option('--minify', '是否压缩')
  .action((options) => {
    console.log(`构建到目录: ${options.output}`);
    if (options.minify) {
      console.log('启用压缩');
    }
    // 执行构建逻辑
  });

program.parse();