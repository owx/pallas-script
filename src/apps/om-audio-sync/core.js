#!/usr/bin/env node
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import https from 'https';
import HttpsProxyAgent from 'https-proxy-agent';


let appSrvHost='http://180.101.239.5:11862';
let omSrvHost='http://192.168.0.100';

// let authorization = 'Bearer f09a7c19-116b-41f1-b458-8097137076a0';
// axios.interceptors.request.use(config => {
//   config.headers['Authorization'] = authorization;
//   return config;
// });


/**
 * 查询应用服务器上记录的录音文件信息
 * @returns 
 */
export function queryAudioFileList() {
  return axios.post(appSrvHost + '/api/admin/omCallRecord/syncAudio');
}


export async function downloadFile(url, dest) {
  const writer = fs.createWriteStream(dest);
  
  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  });
  
  response.data.pipe(writer);
  
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

}

export async function uploadFile(url, id, filePath) {

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('id', id);
  // form.append('description', '这是一张图片');

  return axios.post(url, form, {
    headers: {
      ...form.getHeaders(),
      // 'Content-Length': form.getLengthSync()
    }
  })
  // .then(response => {
  //   console.log('上传成功', response.data);
  // })
  // .catch(error => {
  //   console.error('上传失败', error);
  // });
}

export async function downloadOmAudioFiles(){
  // '/mcc/Recorder/20250513/200_13851736820_20250513-155349_28714.wav');
  let audioFileInfoList = [];
  await queryAudioFileList().then((resp)=>{
    // console.log("resp", resp.data)
    audioFileInfoList = resp.data.data;
    console.log("Found " + audioFileInfoList.length + ' audio files on server.\n');
  })

  if(audioFileInfoList.length>0){
    console.log("发现存在未保存的录音文件，等待5s再处理。")
    await sleep(5000);
  }

  for(let audioFileInfo of audioFileInfoList){
    console.log("Processing file:" + audioFileInfo.cdrFile)

    let url = omSrvHost +  '/mcc/Recorder/' + audioFileInfo.cdrFile;
    let filePath = "./files/" + audioFileInfo.cdrFile;
    ensureDirectoryExists(filePath)

    process.stdout.write('Dowonloading from OM20G...\t');

    let exception = false;
    await downloadFile(url, filePath).then((resp)=>{
      console.log("Done")
    }).catch((reason)=>{
      exception = true;
      console.log('Error')
      console.log('Reason:' + reason);
    })

    if(exception) continue;

    process.stdout.write('Uploadding to server...\t');
    await uploadOmAudioFiles(audioFileInfo.id, filePath).then((resp2)=>{
    console.log("response:", resp2.data)
    });

    console.log("Finish!\n")
  }
}



export async function uploadOmAudioFiles(id, filePath) {
  let url = appSrvHost + '/api/admin/omCallRecord/syncAudio';

  return uploadFile(url, id, filePath);

}

/**
 * 确保目录存在的函数
 * @param {*} filePath 
 * @returns 
 */
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export async function downloadFileWithProxy(url, filePath) {
  // const agent = new https.Agent({  
  //   rejectUnauthorized: false // 跳过TLS证书验证（不推荐在生产环境中使用）
  // });

  // 设置代理服务器
  const proxyUrl = 'http://localhost:7890'; // 代理服务器地址
  const agent = new HttpsProxyAgent(proxyUrl, {});

  axios({
    method: 'get',
    url: url,
    responseType: 'stream',
    httpsAgent: agent,
    proxy: {
      host: '127.0.0.1',
      port: 7890,
      // auth: {
      //   username: 'your-username',
      //   password: 'your-password'
      // }
    }
  }).then(response => {
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('下载完成');
        resolve();
      });
      writer.on('error', reject);
    });
  }).catch(err => {
    console.error('下载失败:', err);
  });
  
}