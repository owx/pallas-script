import sharp from 'sharp';
// import fs from 'fs';

// 单个文件转换
export async function convertSvgToPng(inputPath, outputPath, options = {}) {
  try {
    await sharp(inputPath)
      .resize(options.width || null, options.height || null)
      .png()
      .toFile(outputPath);
    
    console.log(`转换成功: ${outputPath}`);
  } catch (error) {
    console.error('转换失败:', error);
  }
}

// 使用示例
// convertSvgToPng('icon.svg', 'icon.png', { width: 200, height: 200 });