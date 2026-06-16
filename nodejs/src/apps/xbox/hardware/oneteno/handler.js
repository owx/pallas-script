#!/usr/bin/env node
import Logger, { logger } from '#src/utils/LoggerUtils.js'
// const logger = new Logger({ layout: {type: 'pattern', pattern: '%m'} });


export function handlerMessage (topic, message){

  // message 是 Buffer 类型，需要转换为字符串
  const data = message.toString();
  // logger.info(`${topic}: ${data}`, null, "MQTT")

  // if(topic.indexOf("MH1020010601260001") >= 0){
  if( topic == "MH1020010601260001" ) {
    logger.info('\n-----------------------------');
    logger.info(`${topic}: ${data}`, null, "MQTT")
    parseMqtt(topic, data);
  }
}

function parseMqtt(sn, data){
  const otoDataArr = data.split('/');

  logger.info(`左床 ->  体动：${otoDataArr[0]}，呼吸：${otoDataArr[1]}，心率：${otoDataArr[2]}，状态：${getStatus(otoDataArr[3])}`)
  logger.info(`右床 ->  体动：${otoDataArr[5]}，呼吸：${otoDataArr[6]}，心率：${otoDataArr[7]}，状态：${getStatus(otoDataArr[8])}`)

  // logger.info('左床体动幅度', otoDataArr[0]);
  // logger.info('左床呼吸数值', otoDataArr[1]);
  // logger.info('左床心率数值', otoDataArr[2]);
  // logger.info('左床人体状态', getStatus(otoDataArr[3]));
  // logger.info('\n');
  // logger.info('右床体动幅度', otoDataArr[5]);
  // logger.info('右床呼吸数值', otoDataArr[6]);
  // logger.info('右床心率数值', otoDataArr[7]);
  // logger.info('右床人体状态', getStatus(otoDataArr[8]));

}

function getStatus(status){
  const bodyStatus = parseFloat(status);
  // console.log(status + " | " + bodyStatus)
  switch(bodyStatus){
    case 0:
      return "无人";
    
    case 1:
      return "有人";
    
    case 2:
      return "静止";

    case 3:
      return "体动";
          
    default:
      return "数据异常";
  }
}