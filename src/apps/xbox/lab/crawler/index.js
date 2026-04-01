#!/usr/bin/env node
import { crawler } from "./FullCrawler.js";

export async function crawlerApp(){
    console.log("start crawlerApp...")

    try {
        // 静态爬取
        // const staticResult = await crawler.crawl('https://www.baidu.com');
        // console.log('静态页面标题:', staticResult.title);
        // console.log('链接数量:', staticResult.links.length);
        
        // 保存页面
        // await crawler.savePage(staticResult.html, 'example.html');
        
        // 动态爬取
        const dynamicResult = await crawler.crawl('https://www.zhengyao88.com/anal/1101730/30786378.html', {
            useDynamic: true,
            beforeExtract: () => {
                // 滚动到页面底部
                window.scrollTo(0, document.body.scrollHeight);
            }
        });
        console.log('动态页面标题:', dynamicResult.title);
        console.log('详细内容:', dynamicResult);

        
    } catch (error) {
        console.error('爬取失败:', error);
    } finally {
        await crawler.close();
    }

}
