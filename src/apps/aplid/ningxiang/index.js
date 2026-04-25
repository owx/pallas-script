#!/usr/bin/env node
import { batchQueryDeathData, batchQueryDeath, processData} from './gongan/death.js';
// import { autoFillTable } from './assess.js';
// import { parseSqlData } from './sql.js';
// import  ServiceOrderCheck from './jinmin.js';
import { processHujiData } from "./gongan/huji.js";
import { test } from './gongan/index.js';

export async function nxMain(mode, size, file="./oldman.txt") {
    switch(mode){
        case 'slowsql':
            // 慢SQL数据分析
            // parseSqlData("./ecs-mzj-nxylzhx-0007-slow.txt", "test.txt")
            break;

        case 'death':
            // 多元死亡数据查询
            batchQueryDeathData(file, 'A', 0, 100);
            // processData();
            break;

        case "autofill":
            // 宁享-能力等级评估
            // autoFillTable()
            break;

        case "jinmin":
            // 金民工单数据分析
            // let checker = new ServiceOrderCheck();
            // checker.processOrderData('newData.txt')
            // checker.analysisOrderData();
            break;

        case "huji":
            // 户籍数据处理
            processHujiData("D:/Temp/nx/registered_population.txt");
            break;

        default:
            console.log("ap nx -m(mode)")
            console.log("\t-m slowsql \t慢SQL数据分析")
            console.log("\t-m death \t多元死亡数据查询")
            console.log("\t-m autofill \t宁享-能力等级评估自动填表")
            console.log("\t-m jinmin \t金民工单数据分析")
            console.log("\t-m huji \t户籍数据处理")
            break;
    }
}
