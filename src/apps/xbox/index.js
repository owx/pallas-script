#!/usr/bin/env node
import { Command } from 'commander';
import { labMain } from './lab/index.js';
import { qaMain } from './quality/index.js';
import { utilsMain } from './utils/index.js';

const program = new Command();

program
  .name('xbox')
  .description('XBox Development Support CLI Tools')
  .version('1.0.0');


program
  .command('lab')
  .description('Lab实验室工具')
  .option('-m, --mode <string>', '工作模式', 'default')
  .option('-s, --size <number>', '批量处理数量/位置', 1)
  .option('-i, --input <string>', '输入文件')
  .option('-o, --output <string>', '输出文件')
  .action((options) => {
    console.log(`运行Lab实验室工具(参数: mode=${options.mode}, size=${options.size}, input=${options.input}, output=${options.output})`);
    labMain(options.mode, options.size, options.input, options.output);
  });

program
  .command('qa')
  .description('Quality质量工具')
  .option('-m, --mode <string>', '工作模式', 'default')
  .option('-p, --port <number>', '端口号', '3000')
  .option('-h, --host <string>', '主机名', 'localhost')
  .action((options) => {
    console.log(`运行Quality质量工具(参数: mode=${options.mode}, size=${options.size}, input=${options.input}, output=${options.output})`);
    qaMain(options.mode, options.size, options.input, options.output);
  });

program
  .command('utils')
  .description('实用工具集utils')
  .option('-m, --mode <string>', '工作模式', 'default')
  .option('-s, --size <number>', '批量处理数量', '1')
  .option('-i, --input <string>', '输入文件', '.')
  .option('-o, --output <string>', '输出文件', '.')
  .action((options) => {
    console.log(`运行utils实用工具集(参数: mode=${options.mode}, size=${options.size}, input=${options.input}, output=${options.output})`);
    utilsMain(options.mode, options.size, options.input, options.output);
  });

// program
//   .command('fe')
//   .description('FE前端打包工具')
//   .option('-p, --path <dir>', 'OSS路径', '/')
//   .option('-f, --file <dir>', '需要上传的文件')
//   // .option('--minify', '是否压缩')
//   .action((options) => {
//     console.log(`运行Xbox前端打包工具(参数: path=${options.path}, file=${options.file})`);
//     xboxMain(options.path, options.file);
//   });

// program
//   .command('qr')
//   .description('QRCode工具')
//   .option('-p, --port <number>', '端口号', '3000')
//   .option('-h, --host <string>', '主机名', 'localhost')
//   .action((options) => {
//     console.log(`运行QRCode工具`);
//     qrMain();
//   });

// program
//   .command('build')
//   .description('构建项目')
//   .option('-o, --output <dir>', '输出目录', 'dist')
//   .option('--minify', '是否压缩')
//   .action((options) => {
//     console.log(`构建到目录: ${options.output}`);
//     if (options.minify) {
//       console.log('启用压缩');
//     }
//     // 执行构建逻辑
//   });

program.parse();