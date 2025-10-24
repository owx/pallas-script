#!/usr/bin/env node
import { batchQueryDeathData, batchQueryDeath, processData} from './death.js';
// import { autoFillTable } from './assess.js';
// import { parseSqlData } from './sql.js';
// import  ServiceOrderCheck from './jinmin.js';


export async function nxMain() {
    
// 慢SQL数据分析
// parseSqlData("./ecs-mzj-nxylzhx-0007-slow.txt", "test.txt")


// 多元死亡数据查询
batchQueryDeathData('./oldman.txt', 'D', 0, 100);
// processData();

// 宁享-能力等级评估
// autoFillTable()


// 金民工单数据分析
// let checker = new ServiceOrderCheck();
// checker.processOrderData('newData.txt')
// checker.analysisOrderData();


// import { encryptUtil } from '../../common/EncryptUtil.ts'

// let srcData =  {"encryption":"a4Odh3uCMC4gbLzn/v0vLWODNmcMMdccvsSu0l5qPk7pgiPCxG4G9CVURFvhAu8+unr5gXijVnkBgahe6LJka4G3XWicA2iggdefLVxzvOEHqfverTh+268g01tGB/kK3CL2wLlYxAgxemLOUAgXsknuL7ss6T5tOVOA6UaF5jypznzNKJIo67Y4d1IduJjBbbMj0VAiWRZ4U/zSK+kxMxairjCzZy5/DMDfOulVc6UdaW49JupXaL79IlLOLEm5KFEJk/T5TG/+8nCUprcClGJiEqHmB4XoqXHib7D9qQ4NLUxRY4OEZt65bdEro1JVo40l0vB58vfmvYsPg+XD0IXIh3R6eb9Vo+Yu78/KitxAsZlvOq95nADq1nmmMAldBojgcwJ5b1mB4MilkEUHDoqb7yXOaf8l7akOJMefrITjPBGTuzxw/fxwveg0B138Xay2XAy720hQeGyF6U884X5x6LVwrn0msHN3OyGAsCxl2wdxrkdKOVvviIv22vCnMVA3j8aBKFTXd/bs3RftXforLvrG+KxmWyCUWtuDCL6sBm3gCsTFL3spSfeWJy8BX30LWtS25N6Vs+fMBLP7UjA6c11Xv0AMxVBFRMokq/sRWxYJMsTYoJfA7e7weESCB3AGDPzpPd+iAIfddGt3W1J39zFxMMT7JUipgNhxPRNuPl8mLA==","timestamp":"1760671533"};
// let Authorization = 'Bearer 286a7e3d-d3e3-4183-9613-edb68fc29b8f';
// let decryptData = encryptUtil.decrypt(srcData, Authorization)

// console.log(decryptData);
}
