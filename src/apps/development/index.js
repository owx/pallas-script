#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('dev')
  .description('Development Support CLI Tools')
  .version('1.0.0');

program
  .command('start')
  .description('启动开发服务器')
  .option('-p, --port <number>', '端口号', '3000')
  .option('-h, --host <string>', '主机名', 'localhost')
  .action((options) => {
    console.log(`启动服务器在 ${options.host}:${options.port}`);
    // 执行启动逻辑
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