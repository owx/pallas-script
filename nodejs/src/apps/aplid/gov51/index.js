#!/usr/bin/env node

export async function govMain(mode, size, file="./oldman.txt") {
    switch(mode){
 
        case "test":
            // preProcessData();
            break;

        default:
            console.log("ap nx -m(mode)")
            console.log("\t-m slowsql \t慢SQL数据分析")
            console.log("\t-m death \t多元死亡数据查询")
            console.log("\t-m autofill \t宁享-能力等级评估自动填表")
            console.log("\t-m jinmin \t金民工单数据分析")
            console.log("\t-m huji \t户籍数据处理")
            console.log("\t-m geo \t\t地址转经纬度")
            console.log("\t-m xfq \t\t适老化消费券资料下载")
            break;
    }
}
