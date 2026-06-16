#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import PQueue from 'p-queue';
import { axiosManager } from '#utils/AxiosManager.js';
import { logger } from '#src/utils/LoggerUtils.js'
import { pipeline } from 'stream/promises';
import { excelToJson, fileExists} from '#utils/FileUtils.js';

// const logger = new Logger({ layout: {type: 'pattern', pattern: '%m'} });

const authorization = 'Bearer 3721c201-576c-4296-8689-acb3ab9c1865';
const request = axiosManager.createInstance("mca", {
  baseURL: "http://180.101.239.5:11762",
  timeout: 60000,
  headers: {
    Authorization: authorization,
  }
})

/**
 * 宁享-适老化消费券数据下载
 * 环境：线上
 * 
 * @param {*} name 
 * @param {*} idCard 
 * @returns 
 */
async function downloadObsFile(fileName, dest){
  let url = '/admin/obs/download/' + fileName;

  // console.log( 'downloadObsFile->', fileName, dest);
 
  let exists =  fs.existsSync(dest);
  if(exists){
    logger.warn('文件已存在，跳过->',  dest);
    return;
  }

  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const response = await request.get(url, {responseType: 'stream'});
  const writer = fs.createWriteStream(dest);
  await pipeline(response.data, writer);
}

async function downloadByUrl(areaName, name, idCard, orignalUrl, preFix, retryFlag){
  if(orignalUrl!=null){
    const url = decodeURIComponent(orignalUrl);
    // console.log('download url:', url);
    const fileName = path.basename(url);
    const dest = './南京市/' + areaName + '/' + name + '_' + idCard + '/' + (preFix + fileName);

    // console.log( '下载文件->' + fileName, dest);
    try{
      await downloadObsFile(fileName, dest)
    }catch(e){
      logger.error('下载失败->', i, name, idCard, orignalUrl, e);
      throw new Error('下载失败->', i, name, idCard, orignalUrl, e);
    }

  }
}


const queue = new PQueue({
  // intervalCap: 1,   // 每个时间窗口内最多执行的任务数
  // interval: 1000,   // 时间窗口长度（毫秒）
  concurrency: 1,      // 并发数（可选，默认 Infinity）
});

export async function xfqMain(){
  // downloadObsFile("0b6f176df49e3263c11009e38952342c260602753573.jpeg", './a.jpeg');

  const data = await excelToJson('./oldman.xlsx');
  console.log('data:', data.length);

  for(let i=6000; i<data.length; i++){
    let name = data[i].name;
    let idCard = data[i].id_card;
    let areaName = data[i].area_name;

    let contract = data[i].contract;
    let materialBill = data[i].material_bill;
    let commitmentMaterial = data[i].commitment_material;
    let acceptConfirmForm = data[i].accept_confirm_form;
    let invoice = data[i].invoice;
    let selfProof = data[i].self_proof;

    queue.add(async () => {
      logger.info(`开始下载->${name}, ${idCard}`, i, areaName);
      await downloadByUrl(areaName, name, idCard, contract, "验收合格确认单_")
      await downloadByUrl(areaName, name, idCard, materialBill, "材料清单_")
      await downloadByUrl(areaName, name, idCard, commitmentMaterial, "承诺书_")
      await downloadByUrl(areaName, name, idCard, acceptConfirmForm, "")
      await downloadByUrl(areaName, name, idCard, invoice, "发票_")
      await downloadByUrl(areaName, name, idCard, selfProof, "自付凭据_")
    });
  }

}