#!/usr/bin/env node
import { getContractList, getContractDetail, getAuditInfo  } from './core/core.js';


export async function bcMain() {

    // 区块链
    // getContractList(1).then((resp)=>{
    //     console.log(resp.data.data.list)
    // })

    // getContractDetail(353).then((resp)=>{
    //     console.log(resp.data.data)
    // })
    
    getAuditInfo(353).then((resp)=>{
        console.log(resp.data.data)
    })
    
    
    
}
