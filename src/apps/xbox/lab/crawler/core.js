#!/usr/bin/env node
import { crawler } from "#utils/FullCrawler.js";


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
