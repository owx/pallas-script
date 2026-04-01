// import { Tesseract } from 'tesseract.js';

import { createWorker } from 'tesseract.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import readline from 'readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getImagePath() {
  const path = await rl.question('请输入图片路径(或拖拽图片到终端): ');
  return path.trim().replace(/^['"]|['"]$/g, '');
}

async function recognizeText(imagePath) {
  console.log('\n开始识别...');
  
  // 修复方案1：完全不使用 logger 参数
  const worker = await createWorker();
  
  try {
    await worker.load();
    // await worker.loadLanguage('eng+chi_sim');
    await worker.initialize('eng+chi_sim');
    
    // 修复方案2：改用进度事件监听
    worker.on('progress', progress => {
      if (progress.status === 'recognizing text') {
        process.stdout.write(`\r识别进度: ${Math.round(progress.progress * 100)}%`);
      }
    });
    
    const { data: { text } } = await worker.recognize(imagePath);
    return text;
  } finally {
    await worker.terminate();
    console.log('\n');
  }
}

async function main() {
  console.log('=== Node.js OCR 文字识别工具 ===');
  
  try {
    const imagePath = await getImagePath();
    await fs.access(imagePath);
    
    const text = await recognizeText(imagePath);
    
    console.log('\n识别结果:');
    console.log('='.repeat(40));
    console.log(text);
    console.log('='.repeat(40));
    
    const save = await rl.question('\n是否保存结果到文件? (y/n): ');
    if (save.toLowerCase() === 'y') {
      const outputPath = `${imagePath}.txt`;
      await fs.writeFile(outputPath, text);
      console.log(`结果已保存到: ${outputPath}`);
    }
  } catch (error) {
    console.error('\n错误:', error.message);
  } finally {
    rl.close();
  }
}

// main();


// Tesseract.recognizeText("D:\\Temp\\a.jpg").then((data)=>{
//   console.log(data);
// })