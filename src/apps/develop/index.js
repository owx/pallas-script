#!/usr/bin/env node
import { Command } from 'commander';
import { qrMain } from './qrcode/index.js';

const program = new Command();

program
  .name('dev')
  .description('Development Support CLI Tools')
  .version('1.0.0');

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

program.parse();