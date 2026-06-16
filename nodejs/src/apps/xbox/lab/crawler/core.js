#!/usr/bin/env node
import PQueue from 'p-queue';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
// import { logger } from '#utils/logger.js';
import { axiosManager } from '#utils/AxiosManager.js';
import { crawler } from "#utils/FullCrawler.js";

import { logger } from '#src/utils/LoggerUtils.js'
// const logger = new Logger();


// const authorization = 'Bearer 9792bbf2-650b-4943-8945-bd708d26c366';
const request = axiosManager.createInstance("mca", {
    baseURL: "http://localhost:3000",
    timeout: 60000,
    // headers: {
    //     authorization: authorization,
    // }
})
const streamPipeline = promisify(pipeline);


export async function parseHtml(dataFile, start=1, limit=1) {
    logger.info(`文件：${dataFile}, start: ${start}, limit: ${limit}`);

    const queue = new PQueue({
        // intervalCap: 1,   // 每个时间窗口内最多执行的任务数
        // interval: 1000,   // 时间窗口长度（毫秒）
        concurrency: 10     // 并发数（可选，默认 Infinity）
    });

    const data = fs.readFileSync(dataFile, 'utf8');
    const result = await crawler.crawlStatic(null, data);

    for(let idx=(Number(start)-1); idx<(Number(start)+Number(limit)-1); idx++){
        // logger.info(`Loop-> idx=${idx}, max: ${start+limit-1}`);

        const link = result.links[idx];
        queue.add(async () => {
            logger.info(link.text)
            console.log(link.href)
            // logger.info(content)

            const newPage = await crawler.crawlStatic(link.href);
            const content = newPage.$('article').text()
            await text2speech(content, 'records/' +(idx+1) + '.mp3');
        });
    }
}


export async function text2speech(text, output = 'output.mp3', voice = 'zh-CN-XiaoxiaoNeural') {
    const url = "/api/v1/tts/createStream";

    const response = await request.post(url, {
        text: text,
        voice: voice,
    }, { responseType: 'stream' });

    // 返回一个 Promise，等待流处理完成
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(output);
        let length = 0;
        
        response.data.on('data', (chunk) => {
            length += chunk.length;
            process.stdout.write(`\r已接收数据: ${length}`);
            writer.write(chunk);
        });
        
        response.data.on('end', () => {
            writer.end();
            console.log(`音频接收完成 -> ${output}`);
            resolve({
                success: true,
                output: output,
                size: length,
                message: '音频生成成功'
            });
        });
        
        response.data.on('error', (err) => {
            writer.end();
            console.error(`${output} - 流错误:`, err);
            reject({
                success: false,
                output: output,
                error: err,
                message: '音频生成失败'
            });
        });
        
        writer.on('error', (err) => {
            reject({
                success: false,
                output: output,
                error: err,
                message: '文件写入失败'
            });
        });
    });
}


export async function trest(){

    // crawlerStatic(url)
    // processData()

    // request.get("/api/v1/tts/voiceList").then((resp)=>{
    //     console.log(resp.data)
    // })
    

    // const url = "/api/v1/tts/generateJson";
    const url = '/api/v1/tts/createStream';
    const fullPath = "./output.mp3"

    const response = await request.post(url, {
        data: [
            {
              "desc": "徐凤年",
              "text": "你敢动他，我会穷尽一生毁掉卢家，说到做到",
              "voice": "zh-CN-YunjianNeural",
              "volume": "40%"
            },
            {
              "desc": "姜泥",
              "text": "徐凤年，你快走，你打不过的",
              "voice": "zh-CN-XiaoyiNeural"
            },
            {
              "desc": "旁白",
              "text": "面对棠溪剑仙卢白撷的杀意，徐凤年按住剑柄蓄势待发...",
              "voice": "zh-CN-YunxiNeural",
              "rate": "0%",
              "pitch": "0Hz"
            }
          ]
    }, {responseType: 'stream'}).then((resp)=>{
        console.log(resp.data)
    })

    console.log("response", response)
    if (response.config.responseType !== 'stream') {
        throw new Error('responseType 必须是 stream');
    }

    // 使用 pipeline 管理流
    await streamPipeline(response.data, fs.createWriteStream(fullPath));
    console.log(`文件已保存: ${fullPath}`);

}

export async function crawlerStatic(url){
    try {
        // 静态爬取
        const staticResult = await crawler.crawl(url);
        console.log('静态页面标题:', staticResult.title);
        console.log('链接数量:', staticResult.links.length);
        // console.log('详细内容:', staticResult);

        console.log('详细内容:', staticResult.$('article').text());

        // for(const link of staticResult.links){
        //     if(link.title.indexOf("章")>0){
        //         console.log(link.title)
        //     }
        // }
        
    } catch (error) {
        console.error('爬取失败:', error);
    } finally {
        await crawler.close();
    }
}

export async function crawlerDynamic(url){
    try {
        // 动态爬取
        const dynamicResult = await crawler.crawl(url, {
            useDynamic: true,
            beforeExtract: () => {
                // 滚动到页面底部
                window.scrollTo(0, document.body.scrollHeight);
            }
        });
        console.log('动态页面标题:', dynamicResult.title);
        console.log('详细内容:', dynamicResult);
        for(const link of dynamicResult.links){
            if(link.text.indexOf("章")>0){
                console.log(link.text)
            }
        }
    } catch (error) {
        console.error('爬取失败:', error);
    } finally {
        await crawler.close();
    }

}

export async function crawlerSavePage(html, file='example.html'){
    try {
        // 保存页面
        await crawler.savePage(html, file);
    } catch (error) {
        console.error('爬取失败:', error);
    } finally {
        await crawler.close();
    }
}
