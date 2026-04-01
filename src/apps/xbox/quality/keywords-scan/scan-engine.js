#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import { traverseDirectory,  filterFilesByExtension, FILE_TYPES } from './path-traverse.js';

export async function startScan(){
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const __current = process.cwd();

    try {
        const targetDir = path.join(__current, '.');
        const allFiles = await traverseDirectory(targetDir);
        // const imageFiles = filterFilesByExtension(allFiles, FILE_TYPES.IMAGES);
        const codeFiles = filterFilesByExtension(allFiles, FILE_TYPES.CODE);

        console.log('找到的文件:', codeFiles);

    } catch (error) {
        console.error('程序执行出错:', error);
    }
}
