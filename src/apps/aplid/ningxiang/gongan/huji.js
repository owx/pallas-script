import fs from 'fs';
import PQueue from 'p-queue';
import mysql from 'mysql2/promise';
import  { logger } from '#utils/logger.js';
import MysqlUtils from "#src/utils/MysqlUtils.js";
import { queryNjCzrkWithZd } from './core.js';
// import { initDB, saveData, fetchData, dynamicInsert } from '#utils/MysqlUtils.js';

export async function processHujiData(idCardFile, thread=100, startLine=0, limit=10000) {
    
    for(let i=0; i<1; i++){
        console.log("第" + i + "批任务");
        await processHujiDataInner(idCardFile, thread, startLine + i*limit, limit, i+1);
    }
}

export async function processHujiDataInner(idCardFile, thread=1, startLine=0, limit=10, idx) {
    console.log("常驻人口查询！")

    // 1. 初始化数据库连接池
    const pool = mysql.createPool({
        host: '192.168.0.124',
        user: 'root',
        password: 'root',
        database: 'ningxiang',
        waitForConnections: true,
        connectionLimit: 10,
        connectionTimeout: 30000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
    });
    const mysqlUtils = new MysqlUtils(pool);

    // 2. 读取待处理的身份证数据
    const data = fs.readFileSync(idCardFile, 'utf8');
    let list = data.split('\n');
    let size = startLine + limit;
    size = size>list.length? list.length : size;

    // 3. 创建并发任务处理队列
    const queue = new PQueue({
        concurrency: thread,
        // intervalCap: 100,
        // interval: 1000,
        // autoStart: true,
    });

    // const queueManager = new SmartQueueManager();

    let failCount = 0;
    for(let i=startLine; i<size; i++){
        let arr = list[i];
        let idCard =arr.trim();

        logger.info(idCard + " - " + i);
        queue.add(async () => {
        // queueManager.addTask(async () => {

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
                failCount++;
                // 当出现大量失败时，先暂停30s任务，然后再继续执行
                // if(failCount > 1){
                //     console.log("失败任务过多，暂停30s后再继续...")
                //     queue.pause();
                //     failCount = 0;

                //     setTimeout(()=>{
                //         console.log("恢复任务执行！")
                //         queue.start();
                //     }, 30000);
                // }
            })

        });

        // 如果队列积压太多，暂停一下
        // if (queue.size > 1000) {
        //     console.log(`队列积压 ${queue.size} 个任务，暂停添加...`);
        //     queue.pause();
            
        //     // 等待队列处理一部分
        //     await queue.onSizeLessThan(500);
            
        //     console.log("恢复添加新任务...");
        //     queue.start();
        // }

    }

    // 事件监听
    queue.on('active', () => {
        console.log(`第 ${idx} 批任务，队列大小: ${queue.size}`);
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
    await queue.onIdle().then(() => {
        console.log('所有任务完成, 失败:' + failCount);
        pool.end();
    });

}

class SmartQueueManager {
    constructor() {
        // 生产者队列：控制添加速度
        this.producerQueue = new PQueue({ concurrency: 100 });
        
        // 消费者队列：真正执行任务
        this.consumerQueue = new PQueue({ 
            concurrency: 100,
            autoStart: true
        });
        
        this.maxBacklog = 1;
        this.isAddingPaused = false;
    }
    
    async addTask(task) {
        // 如果消费者队列积压太多，暂停添加新任务
        if (this.consumerQueue.size > this.maxBacklog && !this.isAddingPaused) {
            console.log(`队列积压 ${this.consumerQueue.size} 个任务，暂停添加...`);
            this.isAddingPaused = true;
            
            // 等待队列处理一部分
            await this.consumerQueue.onSizeLessThan(500);
            
            console.log("恢复添加新任务...");
            this.isAddingPaused = false;
        }
        
        // 通过生产者队列控制添加速率
        return this.producerQueue.add(async () => {
            // 将任务添加到消费者队列
            return this.consumerQueue.add(task);
        });
    }
    
    async waitForCompletion() {
        await this.producerQueue.onIdle();
        await this.consumerQueue.onIdle();
    }
}