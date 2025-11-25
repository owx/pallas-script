#!/usr/bin/env node
import { Command } from 'commander';
import { xboxMain } from './fe/index.js';
import { qrMain } from './qrcode/index.js';
import { labMain } from './lab/index.js';

const program = new Command();

program
  .name('xbox')
  .description('XBox Development Support CLI Tools')
  .version('1.0.0');

program
  .command('fe')
  .description('FE前端打包工具')
  .option('-p, --path <dir>', 'OSS路径', '/')
  .option('-f, --file <dir>', '需要上传的文件')
  // .option('--minify', '是否压缩')
  .action((options) => {
    console.log(`运行Xbox前端打包工具(参数: path=${options.path}, file=${options.file})`);
    xboxMain(options.path, options.file);
  });

program
  .command('qr')
  .description('QRCode工具')
  .option('-p, --port <number>', '端口号', '3000')
  .option('-h, --host <string>', '主机名', 'localhost')
  .action((options) => {
    console.log(`运行QRCode工具`);
    qrMain();
  });

program
  .command('build')
  .description('构建项目')
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
  .command('lab')
  .description('Lab实验室工具')
  .option('-p, --port <number>', '端口号', '3000')
  .option('-h, --host <string>', '主机名', 'localhost')
  .action((options) => {
    console.log(`运行Lab实验室工具`);
    labMain();
  });

program.parse();