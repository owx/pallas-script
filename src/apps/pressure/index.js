#!/usr/bin/env node
import { uploadFile } from "./utils.js";

console.log("test")

const start = process.hrtime.bigint(); // 返回一个 bigint 类型的纳秒计数

uploadFile("https://chifeng-nx.njapld.com:7979/admin/obs/uploadFile", "123", "D:\\Temp\\IMG_132154484020447264.jpg" ).then((resp)=>{

    const end = process.hrtime.bigint();
    let  elapsed = Number(end - start) / 1e6; // 将纳秒转换为毫秒
    console.log(`异步操作耗时: `  + elapsed );
    console.log(resp.data)

})
