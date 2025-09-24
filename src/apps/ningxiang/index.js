#!/usr/bin/env node
import { batchQueryDeathData, processData} from './death.js';
// import { autoFillTable } from './assess.js';
// import { parseSqlData } from './sql.js';
import  ServiceOrderCheck from './jinmin.js';




// 慢SQL数据分析
// parseSqlData("./ecs-mzj-nxylzhx-0007-slow.txt", "test.txt")


// 多元死亡数据查询
// batchQueryDeathData('./oldman.txt', 'B', 0, 100);
// processData();

// 宁享-能力等级评估
// autoFillTable()


// 金民工单数据分析
let checker = new ServiceOrderCheck();
// checker.processOrderData('newData.txt')
checker.analysisOrderData();
