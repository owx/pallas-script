import log4js from 'log4js';
import path from 'path';

/**
 * 生成带日期时间的文件名
 * 
 * @returns 
 */
function getFileNameWithTime() {
  let now = new Date();
  let timeStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '_',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0')
  ].join('');

  return path.join('logs', `log_${timeStr}.log`);
}

log4js.configure({
  appenders: {
    file: {   //文件日志，生成带日期时间的日志文件，到秒级，正常情况下每次执行时都会生成一个新日志文件
      type: 'file', 
      // lazy: true,  // 只有当日志实际写入时才创建文件
      filename: getFileNameWithTime(),
      layout: {
        type: 'pattern',
        pattern: '%m'
        // pattern: '%[%d{hh:mm:ss.SSS} [%p]%] %m'
        // pattern: '%[%d{yyyy-MM-dd hh:mm:ss.SSS} [%p]%] %m'
      },
    },
    // dateFile:{  //文件日志，按日滚动生成，正常情况下会日志会持续追加
    //   type: 'dateFile',
    //   filename: 'logs/application.log',
    //   pattern: '-yyyy-MM-dd', // 每天创建一个新文件，格式为 application-YYYY-MM-DD.log
    //   // pattern: '_yyyy-MM-dd_hh-mm-ss', // 每小时一个文件
    //   compress: true,
    //   layout:{
    //     type: 'pattern',
    //     pattern: '%m'
    //   }
    // },
    console: {  // 控制台日志，根据日志level展示不同的颜色样式
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%m'
        // pattern: '%[%d{hh:mm:ss.SSS} [%p]%] %m'
        // pattern: '%[%d{yyyy-MM-dd hh:mm:ss.SSS} [%p]%] %m'
      }
    },
    stdout: {  // 控制台日志，无样式日志内容
      type: 'stdout',
      layout: {
        type: 'pattern',
        pattern: '%m'
        // pattern: '%[%d{hh:mm:ss.SSS} [%p]%] %m'
        // pattern: '%[%d{yyyy-MM-dd hh:mm:ss.SSS} [%p]%] %m'
      }
    },
  },
  categories: {
    default: { appenders: ['file', 'console'], level: 'info' },
    // application: { appenders: ['dateFile', 'console'], level: 'info' },
    console: { appenders: ['console'], level: 'info' },
    file: { appenders: ['file'], level: 'info' },
    // dateFile: { appenders: ['dateFile'], level: 'info' },
  }
});


const logger = log4js.getLogger();
// const appLogger = log4js.getLogger("application");
const consoleLogger = log4js.getLogger("console");
const fileLogger = log4js.getLogger("file");
// const dateFileleLogger = log4js.getLogger("dateFile");

export { logger, consoleLogger, fileLogger };
