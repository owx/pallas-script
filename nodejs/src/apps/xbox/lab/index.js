import { downloadTool } from './download/index.js';
import { crawlerApp } from './crawler/index.js';

export async function labMain(mode, size, input, output){

  switch(mode){
      case 'crawler':
      case 'cl':
        await crawlerApp(size);
        break;

      case 'download':
      case 'dl':
        console.log("start download app...")
        downloadTool();
        break;

      default:
        console.log("xbox lab -m(mode)")
        console.log("\t-m crawler|cl : crawler爬虫工具")
        console.log("\t-m download|dl : 下载测试")
        break;
  }

}
