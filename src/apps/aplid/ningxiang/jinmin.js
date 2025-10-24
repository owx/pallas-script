#!/usr/bin/env node
import fs from 'fs';
import readline from 'readline';
import moment from 'moment';
import { count } from 'console';


class ServiceOrderCheck{
  deathMap=[];
  exception0=0;
  exception1=0;
  exception2=0;
  exception3=0;
  exception4=0;
  exception5=0;
  exception6=0;
  exception7=0;
  exception8=0;
  exception9=0;

  constructor(){
    this.init();
  }

  init(){
    this.deathMap= this.loadDeathData();
  }

  processOrderData(fileName){

    // 创建可读流
    const fileStream = fs.createReadStream('gulou_exception_order.json');
    const writeStream = fs.createWriteStream(fileName);
  
    // 创建 readline 接口
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity // 自动识别换行符（Windows/Linux/macOS 兼容）
    });
  
    const linesPerBatch = 49; // 每次读取 3 行
    let buffer = [];
    let count = 0;
  
    // 逐行读取
    rl.on('line', (line) => {
      buffer.push(line);
      if (buffer.length >= linesPerBatch) {
        count++;
        buffer[48] =  '}';
        let newLine = buffer.join('')
  
        let orderJson = JSON.parse(newLine);
        if(orderJson.is_zao === "真"){
          writeStream.write(JSON.stringify(orderJson) + '\n');
        }
  
        // console.log('当前批次:', newLine);
        buffer = []; 
  
        if(count % 10000 ===0){
          console.log(count)
        }
      }
    });
  
    // 文件读取完成
    rl.on('close', () => {
      console.log('原始数据处理完毕！');
    });
  
  }

  analysisOrderData(){

      // 创建可读流
      const fileStream = fs.createReadStream('newData.txt');
      // const writeStream = fs.createWriteStream('exceptionData.txt');

      // 创建 readline 接口
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity // 自动识别换行符（Windows/Linux/macOS 兼容）
      });

      let count = 0;

      let exception0 = 0;

      rl.on('line', (line) => {
        let obj = JSON.parse(line);
        this.checkServeDeathException(obj)

        count++;
        if(count % 10000 === 0){
          console.log(count)
        }
    });

    // 文件读取完成
    rl.on('close', () => {
      console.log('为死亡人员提供服务:' + this.exception0);
      console.log('工单数据分析完毕！');
    });

  }

  checkUseSameIdCardException(objList){
    // objList: [{idCard:string, name:string}]

    let midObjMap = {
      // idCard: {
      //   nameList: [],
      //   count:0
      // }
    };

    objList.map((obj)=>{
      if(midObjMap[obj.idCard]){
        midObjMap[obj.idCard].nameList.push(obj.name);
        midObjMap[obj.idCard].count += 1;
      }else{
        midObjMap[obj.idCard]={
          nameList: [obj.name],
          count: 1,
        }
      }
    })

    let finObjList =[];
    for (const key in midObjMap) {
      if(midObjMap[key] > 1){
        finObjList.push({
          idCard: key,
          count: midObjMap[key],
        })
      }
    }
    
    return finObjList;

  }

  checkServeDeathException(orderInfo){
    let name = orderInfo['服务对象姓名'];
    let idCard = orderInfo['服务对象身份证号'];
    let objDeathDate = this.deathMap[idCard];
    let serviceStartTime = this.dateConvter( orderInfo['服务开始时间'] );

    if(objDeathDate){
      if(serviceStartTime.isAfter(objDeathDate)){
        this.exception0++;
        console.log("(-1)服务时间晚于死亡时间: " + name + "(" + idCard + "), 工单时间:" + serviceStartTime.format("YYYY-MM-DD HH:mm:ss") + ", 死亡时间:" + objDeathDate.format("YYYY-MM-DD"));
      }
    }
  }


  loadDeathData(){
    const data = fs.readFileSync('tbl_oldman_dead.json');
    let deathList = JSON.parse(data);
    let resp = {};
    deathList.map((item)=>{
      const dateStr = item.dead_time;
      const [day, month, year] = dateStr.split('/').map(Number);
      const deathDate = new Date(year, month - 1, day);
      resp[item.id_card] = moment(deathDate);
    })

    return resp;
  }


  dateConvter(dateStr) {
    // const dateStr = "29/3/2022 15:31:58";
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);

    // 月份是 0-based（0 = 一月，11 = 十二月）
    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    return moment(date);
    // console.log(date); // 输出: Tue Mar 29 2022 15:31:58 GMT+0800 (中国标准时间)
  }

}export default ServiceOrderCheck;
