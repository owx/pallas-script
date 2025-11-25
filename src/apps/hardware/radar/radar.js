import { logger } from '#utils/logger.js';

let g_posture = "未知"
let oldTime = new Date();
export function handlerMessage (topic, message){
  // message 是 Buffer 类型，需要转换为字符串
  const hexString = message.toString('hex');
  // console.log(`MQTTX Message ${topic}: ${hexString}`)

  let dType=message[0];
  let com=message[1];
  let length=message[2];
  // console.log("DType", dType)
  // console.log("Com", com)
  // console.log("Length", length)

  if(hexString.length<22){
    console.log("失败1")
  }

  // if(com==1){
  //   return;
  // }

  let peopleNum = message[11];
  const deviceSn = parseDeviceSn(hexString);
  // console.log("deviceSn", deviceSn)
  // if(deviceSn =="13300000341000000461"){
    if(deviceSn =="13300000341000000167"){

    logger.debug("DType:", dType + "\tCom:", com + "\tLength:", length)
    logger.debug(hexString.substring(6, 22)  + " | " + deviceSn); 
    logger.debug(`人数：` + peopleNum)

    // console.log(`MQTTX Message ${topic}: ${hexString}`)
    if(com==1){
      logger.debug(`${topic}: ${hexString}`)

      let persons =  parsePeopleData(message, peopleNum);
      // logger.debug("persons", persons)
  
      if(persons && persons.length>0 && g_posture!=persons[0].postureStr){
        let newTime = new Date();
        let lastTime = newTime - oldTime;
        logger.warn("结束时间：" + formatDate(newTime)  + "   耗时：" + lastTime/1000 + "s");
        oldTime = newTime;
  
        console.log();
  
        g_posture=persons[0].postureStr;
        logger.warn("新的姿势：" + g_posture + " , 开始时间:" + formatDate(oldTime) )
      }

    }else{
      logger.error(`${topic}: ${hexString}`)
    }

  }

}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return `${hours}:${minutes}:${seconds}`;
}

function parseDeviceSn(hexData) {
  // 1. 截取第6到22位（类似StrUtil.sub）
  const hexSub = hexData.substring(6, 22);
  
  // 2. 每2个字符分割成数组（类似StrUtil.split）
  const hexSplit = [];
  for (let i = 0; i < hexSub.length; i += 2) {
    hexSplit.push(hexSub.substr(i, 2));
  }
  
  // 3. 反转数组（类似ArrayUtil.reverse）
  const reverse = hexSplit.reverse();
  
  // 4. 拼接成字符串（类似String.join）
  const result = reverse.join('');
  
  return BigInt('0x' + result).toString();
}

function parsePeopleData(data, peopleNum) {
  const objects = [];
  
  // 假设 data 是 Uint8Array 或 ArrayBuffer
  const view = new DataView(data.buffer || data);

  const timestamp = view.getInt32(12, true);
  // 时间戳转Date对象
  const date = new Date(timestamp);
  // 获取各个时间部分
  const year = date.getFullYear();       // 年
  const month = date.getMonth() + 1;     // 月 (0-11，需要+1)
  const day = date.getDate();            // 日
  const hours = date.getHours();         // 时
  const minutes = date.getMinutes();     // 分
  const seconds = date.getSeconds();     // 秒

  // 格式化输出
  // logger.debug(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);

  
  for (let i = 0; i < peopleNum; i++) {
      const baseOffset = 16 + i * 20;
      
      // 读取小端序的32位整数
      const id = view.getInt32(baseOffset, true);
      const x = view.getInt32(baseOffset + 4, true);
      const y = view.getInt32(baseOffset + 8, true);
      const z = view.getInt32(baseOffset + 12, true);
      
      // 读取单个字节
      const posture = data[16 + i * 20 + 16];
      const breath = data[17 + i * 20 + 16];
      const heart = data[18 + i * 20 + 16];
      const status = data[19 + i * 20 + 16];
      
      // 转换状态字符串（需要实现这些函数）
      const postureStr = getPosture(posture);
      const statusStr = getStatus(status);
      
      logger.info(`目标：${i + 1} tid: ${id} x: ${x} y: ${y} z: ${z} 姿态：${postureStr} 呼吸：${breath} 心率：${heart} 睡眠状态：${statusStr}`);
      
      objects.push({
          targetIndex: i + 1,
          tid: id,
          x: x,
          y: y,
          z: z,
          postureStr: postureStr,  // 姿态
          breath: breath,          // 呼吸
          heart: heart,            // 心率
          statusStr: statusStr     // 睡眠状态
      });
  }
  
  return objects;
}

function getPosture(postrue){
  switch(postrue){
    case 1:
      return "站";

    case 2:
      return "坐";

    case 3:
      return "躺";

    case 4:
      return "摔";
  
    default:
      return "未知";
  }
}

function getStatus(status){
  switch(status){
    case 1:
      return "清醒";

    case 2:
      return "睡觉";

    default:
      return "未知";
  }
}

function getAlert(alert){
  switch(alert){
    case 1: 
      return "摔倒";
    
    case 2: 
      return "离床";
    
    case 3:
      return "滞留";

    case 4: 
      return "无生命体征";
    
    default:
      return "未知";
  }
}