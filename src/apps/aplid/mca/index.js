#!/usr/bin/env node
import { hbAutoSubmitApply } from './homebed/homebed_apply.js';
import { hbJiedaoAutoAudit, hbQuxianAutoAudit } from './homebed/homebed_audit.js';
import { hbAutoSubmitAlloc, hbAutoAllocByFile } from './homebed/homebed_alloc.js';

import { hbAutoChangeOrg } from './homebed/homebed_change_org.js';


import { jjAutoSubmitApply } from './jujia/jujia_apply.js';
import { jjJiedaoAutoAudit, jjQuxianAutoAudit } from './jujia/jujia_audit.js';
import { jjAutoAllocStatistic } from './jujia/jujia_alloc.js';
import { jjAutoJujiaFeeHistoryExport } from './jujia/jujia_fee.js';

export async function mcaMain(mode, size) {

    switch(mode){
        case 'homebed':

            // 街道提交申请
            // hbAutoSubmitApply(100);

            // 街道审核
            // hbJiedaoAutoAudit ("刘勤", 17);

            // 区县审核
            // hbQuxianAutoAudit("654024104000", "麦依尔·革命努尔", 100, "主任")
                
            // （家床）提交初审？
            // hbAutoSubmitAlloc("邹元珍", 1);

            // 
            // hbAutoAllocByFile

            // 验收机构变更
            // hbAutoSubmitApply();

            break;

        case 'jujia':

            // 街道提交申请
            // jjAutoSubmitApply(100);

            // 街道审核
            // jjJiedaoAutoAudit ("刘勤", 17);

            // 区县审核
            // jjQuxianAutoAudit("654024104000", "麦依尔·革命努尔", 100, "主任")

            // 统计数据
            //jjAutoAllocStatistic("d:\\temp\\新源.csv", 500);

            // jjAutoJujiaFeeHistoryExport(".", size);

            break;

        default:
            hbAutoAllocByFile("alloc.txt");
            break;
    }

}



/****************   需求记录

2025/12/17 丁婷  更改验收机构 & 分配
ylfw_654002_0001     Mzj8038@
shfw654002000006     Yns@202510262

2025/11/22
shfw654023000001    Ylz@2025102810
shfw654021000001    Ylz@2025102810

2025/10/20 yinli  吉里于孜镇
账号：jz2024  密码： LIUqin8@jz

2025/10/11
1、霍城县账密
shfw654023000001
Gl@562310
2、尼勒克账密
shfw654028000001
Mzj2027@
3、巩留账密
shfw654024000001
Mzj2026@
4、新源账密
shfw654025000001
Mzj2028@

 2025/10/10 居家养老上门申请&审批
 地区	全国养老服务	密码	可信	密码
吉州区	zhoubin1985	JZQmz@36081	hubo1993	Zb@198521
机构	shfw360802000001	Zb@19852		
古南街道	xiaoliqin	Zb@19852		
樟山镇	zouyuanzhen	Zb@198521		
习溪桥街道	pengdongming	Zb@198521		
永叔街道	liumaodong	Zb@19852		
曲濑镇	wuliuping	Zb@19852160973		
文山街道	xupan	Zb@198522		
兴桥	liusujuan	Zb@198521		
北门街道	huangchengyuan	Zb@198521		
禾埠街道	fuyanyu	Zb@198521		
长塘镇	xiaowei1	Zb@198521		
白塘街道	liuping1	Zb@198521		

2025/09/29
ylfw_654024_0005    Gl@562310
ylfw_654024_0010    Gl@562310
ylfw_654024_0001    Gl@5623109


// 家床-人员分配
shfw654024000001   Mzj2026@


2025/09
乡  镇	帐  号	密 码	姓名
都昌镇	dczczj	Ylfw@2024	曹子敬
中馆镇	dcxzgz	Ylfw@2024	赵益萍
鸣山乡	dcxmsx	Ylfw@2025	刘纹纹
蔡岭镇	dcxclz	Ylfw@2024	彭晖
阳峰乡	dcxyfx	Ylfw@2025	高颖洁
大沙镇	dcxdsz	Ylfw@2024	余满英
大树乡	dcxdsx	Ylfw@2024	曹晶晶
和合乡	dcxhhx	Ylfw@2024	汪家宏

周溪镇	dcxzxz	Ylfw@2024	沈华波
西源乡	dcxxyx	Ylfw@2024	雷蕾
狮山乡	dcxssx	Ylfw@2025	邹兴来
南峰镇	dcxnfx	Ylfw@2024	黄孝国
万户镇	dcxwhz	Ylfw@2024	郑荣欣 
芗溪乡	dcxxxx	Ylfw@2024	张越
土塘镇	ttz123	Ylfw@2025	江艳
三汊港镇	dcxscgz	Ylfw@2025	彭玲娟 
大港镇	dcxdgz	Ylfw@2024	洪燕
春桥乡	dcxcqx	Ylfw@2024	王劲民
徐埠镇	dcxxbz	Ylfw@2025	曹丽娜
汪墩乡	dcxwdj	Ylfw@2025	卢敏青 
苏山乡	dcxssz	Ylfw@2025	邵尤金 
左里镇	dcxzlz	Ylfw@2024	巴志丹
多宝乡	dcxdbx	Ylfw@2024	王玲玲
北山乡	dcxbsx	Ylfw@2024	刘文福 

都昌县民政局帐号：ylfw_360428_0001
            密码：528Yu@18


*/
