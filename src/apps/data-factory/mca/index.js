#!/usr/bin/env node
import { autoSubmitApply } from './jujia_apply.js';
import { jiedaoAutoAudit, quxianAutoAudit } from './jujia_audit.js';

// import { autoSubmitApply } from './mca/homebed_apply.js';
// import { jiedaoAutoAudit, quxianAutoAudit } from './mca/homebed_audit.js';

/*
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


// autoSubmitApply(100);
jiedaoAutoAudit ("孜丽哈·苏里旦", 100);

// quxianAutoAudit("余强强", 1, "主任")