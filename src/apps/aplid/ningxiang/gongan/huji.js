import fs from 'fs';
import PQueue from 'p-queue';
import mysql from 'mysql2/promise';
import  { logger } from '#utils/logger.js';
import MysqlUtils from "#src/utils/MysqlUtils.js";
import { queryNjCzrkWithZd } from './core.js';
// import { initDB, saveData, fetchData, dynamicInsert } from '#utils/MysqlUtils.js';


export async function processHujiData(idCardFile, thread=100, startLine=400000, limit=100000) {
    console.log("常驻人口查询！")

    // 初始化连接池
    const pool = mysql.createPool({
        host: '192.168.0.124',
        user: 'root',
        password: 'root',
        database: 'ningxiang',
        waitForConnections: true,
        connectionLimit: 10,
        connectionTimeout: 10000,
        queueLimit: 0,
        enableKeepAlive: false,
        keepAliveInitialDelay: 0,
    });
  
  // 创建插入器实例
    const mysqlUtils = new MysqlUtils(pool);

    const data = fs.readFileSync(idCardFile, 'utf8');
    const queue = new PQueue({
        concurrency: thread,
        // intervalCap: 100,
        // interval: 1000,
    });

    let list = data.split('\n');
    
    let size = startLine + limit;
    size = size>list.length? list.length : size;

    for(let i=startLine; i<size; i++){
        let arr = list[i];
        let idCard =arr.trim();

        logger.info(idCard + " - " + i);
        queue.add(async () => {

            // 1. 查询数据是否已经存在
            let findResult = await mysqlUtils.findOne("registered_njczrk", {SFZH: idCard})
            if(findResult.found){
                logger.info(idCard + " - " + i + ' skip');
                return "ignore";
            }

            // 2. 查询公安接口获取户籍信息
            await queryNjCzrkWithZd(idCard).then((resp)=>{
                // console.log(resp.data)
                let data = {
                    id: (i+1),
                    SFZH: idCard,
                    status: 'fail'
                }

                if(resp?.data?.rows && resp?.data?.rows?.length == 1){
                    data = {
                        ...(resp.data.rows[0]),
                        id: (i+1),
                    }
                }else{
                    data = {
                        id: (i+1),
                        SFZH: idCard,
                        status: resp.data
                    }
                }

                const result = mysqlUtils.insert('registered_njczrk', data, {
                    filter: {
                      ignoreNull: true,
                      ignoreEmptyString: true
                    }
                }).then((r1)=>{
                    console.log(r1)
                    logger.info(idCard + " - " + i + ' done');
                })

            }).catch((err)=>{
                logger.info(idCard + " - " + i + ' err:' + err);
            })

        });

    }

    // 事件监听
    queue.on('active', () => {
        console.log(`任务开始，队列大小: ${queue.size}`);
    });
    
    queue.on('completed', (result) => {
        // console.log('任务完成:', result);
    });
    
    queue.on('error', (error) => {
        console.error('任务错误:', error);
    });
    
    queue.on('idle', () => {
        console.log('队列空闲');
    });
    
    queue.on('add', () => {
        console.log('任务添加到队列');
    });

    // 暂停队列
    // queue.pause();

    // 开始执行
    // queue.start();

    // 清空队列
    // queue.clear();

    // 等待所有任务完成
    queue.onIdle().then(() => {
        console.log('所有任务完成');
        pool.end();
    });

}