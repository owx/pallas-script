#!/usr/bin/env node
import { Command } from 'commander';
import { bcMain } from './blockchain/index.js';
import { nxproMain } from './nxpro/index.js';
import { govMain } from './gov51/index.js';
import { mcaMain } from './mca/index.js';
import { nxMain } from './ningxiang/index.js';
import { ownMain } from './own/index.js';

const program = new Command();

program
  .name('ap')
  .description('Aplid Project Process CLI Tools')
  .version('1.0.0');

program
  .command('bc')
  .description('南京市政务云区块链服务平台工具')
  .option('-m, --mode <string>', '工作模式', 'default')
  // .option('-o, --output <dir>', '输出目录', 'dist')
  // .option('--minify', '是否压缩')
  .action((options) => {
    bcMain(options.size);
  });

program
  .command('gov')
  .description('5.1智慧养老平台系列工具')
  .option('-m, --mode <string>', '工作模式', 'default')
  .option('-s, --size <number>', '批量处理数量', '1')
  .option('-o, --output <dir>', '输出目录', 'dist')
  .option('--minify', '是否压缩')
  .action((options) => {
    console.log(`运行5.1平台工具(参数: mode=${options.mode}, size=${options.size})`);
    govMain(options.mode, options.size);
  });

program
  .command('mca')
  .description('全国养老信息平台批量数据处理工具集')
  .option('-m, --mode <string>', '工作模式', 'default')
  .option('-p, --page <number>', '当前页码', '1')
  .option('-s, --size <number>', '分页大小', '1')
  .option('-t, --total <number>', '数据总量', '1')
  .option('-f, --file <string>', '需要输入的文件')
  .option('-o, --output <dir>', '输出目录', '.')
  .action((options) => {
    console.log(`运行MCA工具(参数: mode=${options.mode}, page=${options.page}, size=${options.size}, total=${options.total}, file=${options.file}, output=${options.output})`);
    mcaMain(options.mode, options.page, options.size, options.total, options.file, options.output);
  });

program
  .command('nx')
  .description('宁享养老平台批量数据处理工具集')
  .option('-m, --mode <string>', '工作模式', 'default')
  .option('-s, --size <number>', '批量处理数量', '1')
  .option('-f, --file <string>', '需要处理的文件')

  // .option('-o, --output <dir>', '输出目录', 'dist')
  // .option('--minify', '是否压缩')
  .action((options) => {
    console.log(`运行NX工具(参数: mode=${options.mode}, size=${options.size}, file=${options.file})`);
    nxMain(options.mode, options.size, options.file);
  });

program
  .command('nxpro')
  .description('6.0市平台&赤峰家床工具集')
  .option('-m, --mode <string>', '工作模式', 'default')
  .option('-l, --limit <number>', '批量处理数量', '1')
  .option('-n, --name <string>', '关键字名称')
  .option('-o, --output <dir>', '输出目录', '.')
  .option('--minify', '是否压缩')
  .action((options) => {
    console.log(`运行CP工具(参数: mode=${options.mode}, limit=${options.limit})`);
    nxproMain(options.mode, options.limit, options.output);
  });

program
  .command('own')
  .description('自营平台系列工具集')
  .option('-m, --mode <string>', '工作模式', 'default')
  .option('-p, --page <number>', '当前页码', '1')
  .option('-s, --size <number>', '分页大小', '1')
  .option('-t, --total <number>', '数据总量', '1')
  .option('-f, --file <string>', '需要输入的文件')
  .option('-o, --output <dir>', '输出目录', '.')
  .option('--minify', '是否压缩')
  .action((options) => {
    console.log(`运行MCA工具(参数: mode=${options.mode}, page=${options.page}, size=${options.size}, total=${options.total}, file=${options.file}, output=${options.output})`);
    ownMain(options.mode, options.page, options.size, options.total, options.file, options.output);
  });

program.parse();