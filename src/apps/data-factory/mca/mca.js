#!/usr/bin/env node
import fs from 'fs';
import axios from './axios.js';
import { writeFileWithBOM } from '../../common/file.js';
import  { logger } from '../../common/logger.js';
import PQueue from 'p-queue';

/**
 * 
 * 全国养老服务信息平台（机构端）
 * 2024年提升行动项目
 * 居家养老上门服务 | 服务检查验收
 * 查询员工信息
 * 
 */
function queryEmployee(){
  return axios.post('https://ylfw.mca.gov.cn/ylapi/ylptjg/employee/queryEmployeeListByAxbe0001');
}


/**
 * 
 * 全国养老服务信息平台（机构端）-2024年提升行动项目
 * 
 * size: 分页大小默认1
 * type: jtylcwjs 家庭养老床位建设， jjylsmfw 居家养老上门服务
 * flag：1 未分配，2 已分配
 * 
 */
function queryTask(size=1, type='jtylcwjs', flag=1){
  let url = undefined;

  if( type==='jtylcwjs'){
    // 家庭养老床位建设
    url = 'https://ylfw.mca.gov.cn/ylapi/ylpt/v24Allocate/institutionAllocateList';
  }else if( type==='jjylsmfw'){
    // 居家养老上门服务-服务检查验收
    url = 'https://ylfw.mca.gov.cn/ylapi/ylpt/v24Visitingallocate/institutionJDAllocateList';
  }else{
    return  null;
  }

  let params = {
    current: 1,
    size: size,
    year: 2024,
    flag: flag,
  }

  return axios.post(url, null, {params: params});
}


/**
 * 2024年提升行动项目-居家养老上门服务-服务检查验收
 * 
 * @param {*} ahbx1501 
 * @param {*} ahdx6124 
 * @returns 
 */
function assignTask ( ahbx1501, ahdx6124){
  let params = {
    // ahbx1501: 'a6777e2c2f904881adaca58ce8bdffce',
    ahbx1501: ahbx1501,
    year: 2024,
    // ahdx6124: '725db84e398741a78d5e42460d9691d8',
    ahdx6124: ahdx6124,
  }
  return  axios.post('https://ylfw.mca.gov.cn/ylapi/ylpt/v24Visitingallocate/institutionJDAllocate', null, {params: params})
}


/**
 * 2024年提升行动项目-家庭床位建设-服务人员分配
 * 分派类型：验收
 * srvObjId(ahbx1601): 服务对象的ID
 * taskType(ahbx1701): 1 评估，2 实施，3 验收
 * 
 * @returns 
 */
function assignHomeBedTask(srvObjId, taskType, ahdx6124, axbe0001){
  let data = {
    "ahbx1601": srvObjId,
    "ahbx1701": taskType,
    "ahdx6124": ahdx6124,
    "axbe0001": axbe0001,
    "year": "2024"
    }

    return  axios.post('https://ylfw.mca.gov.cn/ylapi/ylpt/v24Allocate/institutionAllocate', data)

}


/**
 * 解析待分配任务列表数据，然后以csv格式输出关键几个字段内容
 * 
 * @param {*} dataFilePath 
 * @param {*} storeFilePath 
 */
export function parseOriginalData(dataFilePath, storeFilePath) {

  try{
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    let jsonData = JSON.parse(rawData);
    // console.log(rawData);
    // console.log(jsonData);

    let records = jsonData.data.records;
    let csvContet = "";
  
    for(let obj of records){
  
        console.log(obj.ahbx1502 + "," + obj.ahbx1503 + "," + obj.ahbx1601 + "," + obj.ahbx1701);
        csvContet += obj.ahbx1502 + "," + obj.ahbx1503 + "," + obj.ahbx1601 +  "," + obj.ahbx1701 + '\n';
        // console.log(obj.ahbx1502);
        // console.log(obj.ahbx1601);
    }
  
    writeFileWithBOM(storeFilePath, csvContet);

  }catch(err){
    console.log(err)
  }
}


/**
 * 全国养老信息网-任务自动分配
 */
export async function autoAssign() {
  // 任务对象信息
  // let ahbx1501 = '';

  // 员工信息
  let employee;

  // 1. 查询员工信息
  await queryEmployee().then(resp => {
      // console.log(JSON.stringify(response.data))
      console.log(resp.data)
      
      if(resp.data.data.length>1){
          // console.log('员工数量大于1人，需要指定具体分配人员!')
          return;
      }
      employee = resp.data.data[0];
      // ahdx6124 = resp.data.data[0].ahdx6124;

  }).catch(error => {
      console.error('Error:', error);
  });

  let employeeId = null;
  let employeeName = null;

  if(employee == undefined){

      console.log('员工数量大于1人，需要指定具体分配人员!')
      return;

      // 可以临时注销上面的return，直接使用下面的配置来分配
      employeeName = '陈青山';
      employeeId = '1d919d456f784edbaaf1bf084ec079d6';

  }else{
    employeeId = employee.ahdx6124;
    employeeName = employee.ahdx6125;
  }

  // 2. 查询任务信息
  let taskList = [];
  await queryTask(100, "jtylcwjs").then(resp => {
      console.log(JSON.stringify(resp.data))
      // console.log(resp.data)
      taskList = resp.data.data.records;
  }).catch(error => {
      console.error('Error:', error);
  });

  // 3. 执行分配任务
  const queue = new PQueue({ concurrency: 1 });
  for(let i=0; i<taskList.length; i++){
    let task = taskList[i];

    // logger.info('分配任务 ' +  task.ahbx1502 + '( ' + task.ahbx1501 + ')  ==> ' + ahdx6125 + '(' + ahdx6124 + ')');

    let srvObjxxx = task.ahbx1501;
    let srvObjName = task.ahbx1502;
    let srvObjIdCard = task.ahbx1503;
    let srvObjIdArea = task.ahbx1506;
    let srvObjIdPhone = task.ahbx1511;
    let srvObjId = task.ahbx1601;
    let axbe0001 = task.axbe0001;
    let taskType = task.ahbx1701;

    // logger.info('分配任务 ' +  task.ahbx1502 + '( ' + task.ahbx1501 + ')  ==> ' + ahdx6125 + '(' + ahdx6124 + ')');
    queue.add(async () => 
      await assignHomeBedTask(srvObjId, taskType, employeeId, axbe0001 ).then(resp => {
            logger.info('分配任务 (类型：'  + taskType  + ')' +  srvObjName + '( ' + task.ahbx1501 + ')  ==> ' + employeeName + '(' + employeeId + ')' + JSON.stringify(resp.data));
        }).catch(error => {
            console.error('Error:', error);
        })
    );

  }

}
