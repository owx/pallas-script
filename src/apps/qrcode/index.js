#!/usr/bin/env node
import { generateImageWithQRCodeAndText } from './core.js';


function app_start() {

  // 使用示例
  const qrText = 'https://www.example.com';
  const backgroundPath = 'background.png'; // 背景图片路径
  const outputPath = 'output.png'; // 输出文件路径

  // 设置二维码的边距：顶部 50px，右侧 50px，添加文字
  const message = "这是一个自定义的文字!";
  generateImageWithQRCodeAndText(qrText, backgroundPath, outputPath, 350, 100, message);

}

app_start();
