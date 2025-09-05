#!/usr/bin/env node
import { autoAssign, parseOriginalData } from './mca.js';

// autoAssign();
// parseOriginalData("./sample.txt", 'output.csv')

let source = "i{{person.name}}"

let newVal = source;

const varNames = [...source.matchAll(/\{\{([\w\.]+)\}\}/g)].map(match => match[1]);
for(let varName of varNames){
    if(varName.includes('.')){
        let varVal = "xddd"
        newVal = newVal.split(`{{${varName}}}`).join(varVal);
    }
}

console.log(newVal)