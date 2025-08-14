#!/usr/bin/env node
const axios = require('axios');

let url = "https://liuhe.zhyl.njapld.com:8081/static/js/chunk-ef8afc1e.ce42ff85.js"
let url2='https://liuhe.zhyl.njapld.com:8081/';

axios.get(url)
    .then(response => {
        // console.log(response.data);
        parseStaticPage(response.data);
    })
    .catch(error => {
        console.error('Error:', error);
    });


function parseStaticPage(content){

    let phoneRegex = /(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}/g;
    let urlRegex = /http?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*/i;
    let idCardRegex = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
    let passwordRegex =/password/g;

    let matches = content.match(phoneRegex);

    console.log(matches)

}