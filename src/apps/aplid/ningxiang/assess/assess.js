#!/usr/bin/env node
import axios from 'axios';
import PQueue from 'p-queue';

let baseUrl = "https://mzj.nanjing.gov.cn/nxyl";
let Authorization = 'bearer 2c33687e-93c3-4ba3-b8e9-d0f7d22c4747';
axios.interceptors.request.use(config => {
  config.headers['Authorization'] = Authorization;
  return config;
});


/**
 * 获取本人评估任务列表
 */
function bscTaskItem() {
  let data = {"taskType":"2","pageParaPO":{"size":10,"current":1}}

  axios.post(baseUrl  + '/application/bscTaskItem/page', data)
    .then(response => {
      // console.log(JSON.stringify(response.data))
      console.log(response.data)
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


/**
 * 获取评估Table表格
 */
function bscAssessTableInfo() {
  let data = {assessType: 2}

  axios.post(baseUrl  + '/application/bscAssessTableInfo/list', data)
    .then(response => {
      // console.log(JSON.stringify(response.data))
      console.log(response.data)
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


/**
 * 获取评估Table中的题目
 */
function bscAssessTableItem() {
  let data = {"assessType":2,"tableId":"73ba60188f264c4a9a090a24b46e8d5d","taskItemId":"1891450578691543042","pageParaPO":{"size":10,"current":1}}

  axios.post(baseUrl  + '/application/bscAssessTableItem/page', data)
    .then(response => {
      // console.log(JSON.stringify(response.data))
      console.log(response.data)
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


/**
 * 填写评估选项内容
 */
function addOrUpdateAnswer() {
  let data = {
    "extendContent": "",
    "answerType": 1,
    "content": "1854044627435286529",
    "tableId": "73ba60188f264c4a9a090a24b46e8d5d",
    "assessType": 2,
    "tableTitle": "环境",
    "taskId": "1891450578628628482",
    "taskItemId": "1891450578691543042",
    "taskName": "百汇吉养老服务中心机构等级评定",
    "itemId": "1854044424682631170"
  }

  axios.post(baseUrl  + '/application/bscAssessTableAnswer/addOrUpdateAnswer', data)
    .then(response => {
      // console.log(JSON.stringify(response.data))
      console.log(response)
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


/**
 * 宁享-机构等级评估-自动填写评估表单
 */
export async function autoFillTable(){

  // 1. 获取任务列表（taskType： 1. 老人能力等级评估， 2. 机构等级评估）
  let taskResp = await axios.post(baseUrl  + '/application/bscTaskItem/page', {
    "taskType": "2",
    "pageParaPO": {
      "size": 10,
      "current": 1
    }
  })
  console.log(taskResp.data)
  let taskList = taskResp.data.data.records;

  // 2. 选择任务，默认选择第一条任务
  // console.log(taskList[0]);
  let taskItemId = taskList[0].id;
  let taskId = taskList[0].taskId;
  let taskName = taskList[0].taskName;

  // 3. 接受任务|拒绝任务

  // 4. 获取题库大类（例如：环境、设施设备、运营管理、服务等）
  let tableResp = await axios.post(baseUrl  + '/application/bscAssessTableInfo/list', {assessType: 2})
  let tableList = tableResp.data.data;

  // console.log(tableList);
  // return;

  // 5. 获取任务详情信息
  // let taskDetailResp = await axios.post(baseUrl  + '/application/bscServiceOrgAssess/getByTaskItemId', {taskItemId: taskItemId})
  // let taskDetail = tableResp.data.data;

  const queue = new PQueue({ concurrency: 1 });

  // 6. 按照题库大类分别处理
  let count = 0;
  let scores = [];
  tableList.forEach(async table => {
    let assessType = table.assessType;
    let tableId = table.id;
    let tableTitle = table.tableTitle;

    let param = {
      "assessType": assessType,
      "tableId": tableId,
      "taskItemId": taskItemId,
      "pageParaPO": {
        "size": 500,
        "current": 1
      }
    }

    // 7. 获取当前大类下题库列表
    let itemResp = await axios.post(baseUrl  + '/application/bscAssessTableItem/page', param)
    let itemList = itemResp.data.data.records;

    // 8. 遍历当前大类下的所有题库列表
    itemList.forEach(async item => {
      let optionList = item.optionList;
      if( optionList!=null ){


        // console.log(data)

        // 使用默认第一选项答题
        queue.add(async () => {
          let idx = Math.floor(Math.random()*optionList.length);

            let data = {
              "extendContent": "自动化填写表单",
              "answerType": 1,
              "content": optionList[idx].id,
              "tableId": tableId,
              "assessType": assessType,
              "tableTitle": tableTitle,
              "taskId": taskId,
              "taskItemId": taskItemId,
              "taskName": taskName,
              "itemId": optionList[idx].itemId
            }
    
            const optionsContent = optionList.map(option => option.optionContent).join('\t');
            let score =+  optionList[idx].optionScore;
            scores.push(score);

            console.log('----------------------------------------------------------------------------')
            console.log(item.itemTitle)
            console.log("选项：" + optionsContent)
            console.log("答案：" + optionList[idx].optionContent + "\n")

            await axios.post(baseUrl  + '/application/bscAssessTableAnswer/addOrUpdateAnswer', data)
            count++;
          }
        );


      }
    });
  });

  // 判断所有任务完成
  queue.onIdle().then(() => {
    const total = scores.reduce((sum, val) => sum + val, 0);
    console.log("Total:" + count);
  });
}
