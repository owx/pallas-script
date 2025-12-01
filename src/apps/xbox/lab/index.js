import axios from 'axios';
import fs from 'fs';
import path from 'path';

export function labMain(){
  console.log("hello xxx")

  const proxyConfig = {
    protocol: 'http',
    host: '127.0.0.1',
    port: 2081,
    // 如果需要认证
    // auth: {
    //   username: 'proxy-user',
    //   password: 'proxy-password'
    // }
  };

  // downloadWithAxiosProgress("https://r3---sn-i3belnl7.googlevideo.com/videoplayback?expire=1764081668&ei=pGslacuIEoW9zPsPtozq0AI&ip=80.187.123.92&id=o-AHRVPCrFGTPzuuWPRGsXmmWJo-b7AIKtD7LK_ZPKywvC&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&rms=au%2Cau&bui=AdEuB5Ty6rEUv-lV8_ATGSww-4del1MKPkLnA2yiEpq6v8-Ey1uTn8FTzupmusd7l_QGaKZWbF_g-SAT&spc=6b0G_CBmryO3&vprv=1&svpuc=1&mime=audio%2Fmp4&rqh=1&gir=yes&clen=305955393&dur=18904.896&lmt=1681072437664282&keepalive=yes&fexp=51552689,51565116,51565682,51580968&c=ANDROID&txp=6218224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRgIhAMXZ7XGzXkw6BljE1WkadvMN6upp77B-ZWnkV-9g8rG3AiEA_7N7gXhIfC-QeVk_ZCUtOSeFv9CsC4TMadf6-eSQOIo%3D&cps=100&redirect_counter=1&rm=sn-un5ee7e&rrc=104&req_id=91dcb917a474a3ee&cms_redirect=yes&cmsv=e&ipbypass=yes&met=1764060071,&mh=4a&mip=2a09:bac5:398c:16c8::245:3a&mm=31&mn=sn-i3belnl7&ms=au&mt=1764059814&mv=m&mvi=3&pl=44&lsparams=cps,ipbypass,met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=APaTxxMwRQIgPSh_9SDW9ISWWR3Im3hRbUDHUmQR_KhcfKl_tvqb78sCIQDTnpjlc6VJoMX1Bq3QBVP64q3uV3kbu-oSiFtTTPdO9g%3D%3D", "./", proxyConfig)
  // downloadWithAxiosProgress("http://pallas.local:9000/public/test/x.png", "x.png")

  // downloadWithAxiosProgress("https://www.google.com", "gx", proxyConfig)
  downloadWithAxiosProgress("https://www.baidu.com", "bx")

}

/**
 * 使用 axios 下载文件
 */
async function downloadWithAxios(url, outputPath, proxyConfig) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream', // 重要：使用流式响应
      timeout: 30000,
      proxy: proxyConfig // 代理配置
    });
    
    // 确保下载目录存在
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const writer = fs.createWriteStream(outputPath);
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('文件下载完成:', outputPath);
        resolve(outputPath);
      });
      
      writer.on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    });
    
  } catch (error) {
    console.error('Axios下载失败:', error);
    throw error;
  }
}

/**
 * 带进度显示的 axios 下载
 */
async function downloadWithAxiosProgress(url, outputPath, proxyConfig) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 30000,
      proxy: proxyConfig // 代理配置
    });
    
    const totalSize = parseInt(response.headers['content-length'], 10);
    let downloadedSize = 0;
    
    // 确保目录存在
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const writer = fs.createWriteStream(outputPath);
    
    response.data.on('data', (chunk) => {
      downloadedSize += chunk.length;
      
      if (totalSize) {
        const percent = ((downloadedSize / totalSize) * 100).toFixed(2);
        process.stdout.write(`\r下载进度: ${percent}% (${downloadedSize}/${totalSize} bytes)`);
      }
    });
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('\n下载完成:', outputPath);
        resolve(outputPath);
      });
      
      writer.on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    });
    
  } catch (error) {
    console.error('下载失败:', error);
    throw error;
  }
}