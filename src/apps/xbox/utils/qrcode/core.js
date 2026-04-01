#!/usr/bin/env node
import path from 'path';
import sharp from 'sharp';
import QRCode from 'qrcode';
import { createCanvas, loadImage, registerFont } from  'canvas';
import { fileURLToPath } from 'url';


// 获取当前模块的目录路径
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 注册自定义字体
// registerFont(path.join(__dirname, 'fonts', 'msyh.ttc'), { family: 'Microsoft YaHei' });

// 将文字分行并居中显示
function drawTextWithWrapAndCentering(ctx, text, x, y, maxWidth, fontSize) {
  const words = text.split('');  // 按空格分割单词
  let line = '';  // 当前行的文本
  let lineHeight = fontSize * 1.5;  // 行高，可以根据字体大小调整

  // 设置字体样式
  ctx.font = `${fontSize}px "Microsoft YaHei"`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // 逐行绘制文字
  for (let i = 0; i < words.length; i++) {
    const testLine = line + (line ? ' ' : '') + words[i];
    const testWidth = ctx.measureText(testLine).width;

    // 如果当前行宽度超出最大宽度，则换行
    if (testWidth > maxWidth) {
      // 绘制当前行，并开始新的行
      ctx.fillText(line, x, y);
      line = words[i];  // 当前行重置为当前单词
      y += lineHeight;  // 下一行的 Y 坐标
    } else {
      line = testLine;  // 当前行加上当前单词
    }
  }

  // 绘制最后一行文字
  ctx.fillText(line, x, y);
}

// 生成二维码并添加背景图片和文字
export async function generateImageWithQRCodeAndText(text, backgroundPath, outputPath, marginTop, marginRight, message) {
  try {
    
    // 2. 获取背景图片的尺寸
    const { width: bgWidth, height: bgHeight } = await sharp(backgroundPath).metadata();

    // 1. 生成二维码
    let data = text;
    let options = {
      errorCorrectionLevel: 'H',  // L:7% M:15% Q:25% H:30%
      width: bgWidth *0.8,
      // height: 256,
      // margin: 4,
      // colorDark: '#000000',
      // colorLight: '#ffffff',
      // type: 'buffer',             //'buffer'、'base64' 或 'svg'
      // scale: 8,
      // version: 1,
      // bbox: false,
      // quality: 0.92,
      // callback: function
    }
    const qrCodeBuffer = await QRCode.toBuffer(data, options);

    // 3. 读取背景图片并调整大小
    const backgroundImage = await loadImage(backgroundPath);

    // 4. 获取二维码的尺寸
    const qrCodeMetadata = await sharp(qrCodeBuffer).metadata();

    // 5. 计算二维码的位置
    const x = bgWidth - qrCodeMetadata.width - marginRight;  // 右侧边距
    const y = marginTop;  // 顶部边距

    // 6. 使用 canvas 绘制文字
    const canvas = createCanvas(bgWidth, bgHeight);
    const ctx = canvas.getContext('2d');

    // 先绘制背景图
    ctx.drawImage(backgroundImage, 0, 0, bgWidth, bgHeight);

    // 设置文字样式，使用自定义字体
    ctx.font = '36px "Microsoft YaHei"';  // 使用已注册的字体
    ctx.fillStyle = 'black'; // 文字颜色
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    // 绘制文字（可以根据需求调整位置）
    const marginBottom = 200;  // 设置文字距离底部的边距
    // ctx.fillText(message, 50, bgHeight - marginBottom);  // 文字位置
    // ctx.fillText("云南省临沧市凤庆县友善大街934号云南省临沧市凤庆县友善大街934号", 250, 250);  // 文字位置
    // ctx.fillText("沈尚龙", 250, 300);  // 文字位置
    // ctx.fillText("500224193407186032", 250, 350);  // 文字位置

    // 计算文字居中位置
    const textWidth = ctx.measureText(text).width;
    const centerX = bgWidth / 2;  // 画布宽度的中心

      // 绘制文本并自动换行
    let text1 = "云南省临沧市凤庆县友善大街934号";
    let text2= "沈尚龙";
    let text3 = "500224193407186032";
    let maxLineWidth = bgWidth * 0.8;
    drawTextWithWrapAndCentering(ctx, text1, centerX, 200, maxLineWidth, 36);
    drawTextWithWrapAndCentering(ctx, text2, centerX, 250, maxLineWidth, 36);
    drawTextWithWrapAndCentering(ctx, text3, centerX, 300, maxLineWidth, 36);

    // 7. 将二维码图像加载到 canvas 上
    const qrCodeImage = await loadImage(qrCodeBuffer);  // 将二维码 Buffer 转为图像对象
    ctx.drawImage(qrCodeImage, x, y, qrCodeMetadata.width, qrCodeMetadata.height);  // 绘制二维码

    // 8. 获取合成后的图像，并保存为文件
    const finalImageBuffer = canvas.toBuffer('image/png');
    await sharp(finalImageBuffer).toFile(outputPath);

    console.log('图像已生成并保存到：', outputPath);
  } catch (error) {
    console.error('生成图像失败：', error);
  }
}