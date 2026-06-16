#!/usr/bin/env node
import { dmExample } from './order/index.js';
import { tryDifferentMethods } from './order/dm.js';


export async function cfMain(mode, size) {
    

    switch(mode){

        case 'order':
            // dmExample();
            // tryDifferentMethods();
            break;

        case 'homebed':
        default:
            break;
    }
}
