#!/usr/bin/env node
import { crawlerStatic, crawlerDynamic, crawlerSavePage } from "./core.js";
import { parseHtml } from "./parser.js";

export async function crawlerApp(){
    console.log("start crawlerApp...")

    const url = 'https://www.zhengyao88.com/anal/1101730/29401710.html';
    // const url ='https://www.zhengyao88.com/anal/1101730'

    parseHtml("chap.txt");

    // crawlerStatic(url)

    // processData()


}
