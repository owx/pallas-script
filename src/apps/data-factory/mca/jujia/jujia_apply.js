#!/usr/bin/env node
import PQueue from 'p-queue';
import { queryPrjInfo, jujiaOrgList,  jujiaApplyList, queryUserInfo, jujiaApplySubmit } from "../mca_core.js";
import  { logger } from '../../../../common/logger.js';
import { jujiaServiceList } from './data/constants.js'


/**
 * 主入口，自动化处理
 */
export async function autoSubmitApply(size=1){

  
  // 1. 获取当前项目信息（认定标准）
  let prjInfoResp = await queryPrjInfo()
  let prjInfo = prjInfoResp.data.data;
  let ahbx1401 = prjInfo.ahbx1401;  // code
  let ahbx1402 = prjInfo.ahbx1402;  // 城市低收入老年人认定标准
  let ahbx1411 = prjInfo.ahbx1411;  // 农村低收入老年人认定标准
  // let jjsm09List = prjInfo.jjsm09List;  // 居家服务项目列表信息  ( 好像不能用，得排查一下)
  // logger.info("查询项目信息:", prjInfo)


  // 2. 获取用户登录信息（主要是获取areaCode信息）
  let uesrInfoResp = await queryUserInfo()
  let uesrInfo = uesrInfoResp.data.data;
  let areaCode = uesrInfo.sysUser.areaCode;
  // logger.info("获取用户登录信息:", uesrInfo)
  logger.info("获取用户areaCode:", areaCode)
  if(!areaCode){
    logger.info("获取用户areaCode失败")
    return;
  }

  // 3. 获取服务组织信息
  let orgListResp = await jujiaOrgList(areaCode)
  let orgList = orgListResp.data.data;
  // logger.info("获取服务组织信息:", orgList)
  if((!orgList) || orgList.length>1 || orgList.length==0){
    console.log("获取到的服务组织超过一个，需要先确定一下使用哪个！")
    return;
  }
  let axbe0001 = orgList[0].axbe0001; //机构代号
  let axbe0003 = orgList[0].axbe0003; //机构名称


  // 4. 生成服务项目列表
  let jjsm04DtoList = jujiaServiceList.map((item)=>{
    return   {
      axbe0001: axbe0001,
      axbe0001Name: axbe0003,
      ahae0621: item.ahae0621,
      ahae0618: item.ahae0618,
    }
  })
  // logger.info("生成服务项目列表:", jjsm04DtoList)


  // 5. 获取申请列表
  let applyListResp = await jujiaApplyList(size);
  let applyList = applyListResp.data.data.records;
  // console.log(applyList);
  logger.info("获取申请列表: ", applyList.length + ' 个')


  // 6. 自动提交
  const queue = new PQueue({ concurrency: 1 });
  for(let i=0; i<applyList.length; i++){
    let apply = applyList[i];

    // 生成提交参数
    let jjsm0201 = apply.jjsm0201;
    let ahbx1501 = apply.ahbx1501;
    let hbx15Dto = {
      ahbx1501:apply.ahbx1501,
      ahbx1502:apply.ahbx1502,
      ahbx1503:apply.ahbx1503,
      ahbx1504:apply.ahbx1504,
      ahbx1505:apply.ahbx1505,
      ahbx1506:apply.ahbx1506,
      ahbx1508:apply.ahbx1508,
      ahbx1511:apply.ahbx1511,
      ahbx1402: ahbx1402,
      ahbx1411:ahbx1411,
    }

    let param = {
      jjsm0201: jjsm0201,
      ahbx1501: ahbx1501,
      hbx15Dto: hbx15Dto,
      jjsm04DtoList: jjsm04DtoList,
    }

    console.log(param)
    queue.add(async () => 
      await jujiaApplySubmit(param).then(resp => {
        logger.info(resp.data)
      }).catch(error => {
            console.error('Error:', error);
      })
    );

  }
}




