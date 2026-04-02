#!/usr/bin/env node
import { parseHtml, text2speech } from './core.js';

export async function crawlerApp(start, input="chap.txt", output) {
    console.log("start crawlerApp...")

    await parseHtml(input, start, 10);

    // text2speech('这是一段很长的文本，会通过流式方式逐步生成音频...')
}
