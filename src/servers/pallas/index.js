#!/usr/bin/env node
import { Command } from 'commander';
import { startServer } from './stark/index.js';

const program = new Command();

program
  .name('pa')
  .description('Pallas Server CLI Tools')
  .version('1.0.0');

program
  .command('stark')
  .description('Stark Data Center')
  .option('-s, --size <number>', '批量处理数量', '1')
  // .option('-h, --host <string>', '主机名', 'localhost')
  .action((options) => {
    console.log(`运行Stark工具，数据处理上限配置：${options.size}`);
    startServer();
  });


program.parse();