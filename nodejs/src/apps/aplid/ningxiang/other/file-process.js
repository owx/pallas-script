#!/usr/bin/env node
const fs = require('fs');
const readline = require('readline');
// const moment = require('moment');

const args = process.argv.slice(2);
const fileName = args[0];

// 异步读取文件
// fs.readFile(fileName, 'utf8', (err, data) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   console.log("____________________")
//   console.log(data);
// });

// // 同步读取文件
// try {
//   const data = fs.readFileSync('example.txt', 'utf8');
//   console.log(data);
// } catch (err) {
//   console.error(err);
// }


const fileStream = fs.createReadStream(fileName);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let i=0;
rl.on('line', (line) => {
  // console.log(`Line from file: ${line}`);

    // let record = JSON.parse(line);
    // let timestamp= record[0].admissionTime;
    // const date = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
    // record[0].admissionTime = date;
    // console.log(JSON.stringify(record));

  console.log(new Date())
  if(i%100==0){
     console.log(i++) 
  }
  if(line.indexOf("jin_push_batch_info") >= 0){
      console.log(line)
  }




});
 
rl.on('close', () => {
  // console.log('File has been read');
});