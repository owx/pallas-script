#!/usr/bin/env node
import { Command } from 'commander';
import { bcMain } from './blockchain/index.js';
import { cpMain } from './city-platform/index.js';
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
  .option('-m, --mode <string>', '工作模式', 'default')
  // .option('-o, --output <dir>', '输出目录', 'dist')
  // .option('--minify', '是否压缩')
  .action((options) => {
    bcMain(options.size);
  });

program
  .command('mca')
  .description('全国养老信息平台批量数据处理工具集')
  .option('-m, --mode <string>', '工作模式', 'default')
  .option('-s, --size <number>', '批量处理数量', '1')
  .action((options) => {
    console.log(`运行MCA工具(参数: mode=${options.mode}, size=${options.size})`);
    mcaMain(options.mode, options.size);
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
  .command('cp')
  .description('市平台6.0&赤峰平台工具集')
  .option('-m, --mode <string>', '工作模式', 'default')
  .option('-l, --limit <number>', '批量处理数量', '1')
  .option('-n, --name <string>', '关键字名称')
  .option('-o, --output <dir>', '输出目录', '.')
  .option('--minify', '是否压缩')
  .action((options) => {
    console.log(`运行CP工具(参数: mode=${options.mode}, limit=${options.limit})`);
    cpMain(options.mode, options.limit, options.output);
  });

program
  .command('cf')
  .description('赤峰市养老平台批量数据处理工具集')
  .option('-m, --mode <string>', '工作模式', 'default')
  .option('-s, --size <number>', '批量处理数量', '1')
  .option('-o, --output <dir>', '输出目录', 'dist')
  .option('--minify', '是否压缩')
  .action((options) => {
    console.log(`运行CF工具(参数: mode=${options.mode}, size=${options.size})`);
    cfMain(options.mode, options.size);
  });

program
  .command('ms')
  .description('5.1平台菜单同步工具')
  .option('-m, --mode <string>', '工作模式', 'default')
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