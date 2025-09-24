import axios from 'axios';
import { createServer } from 'http';
import { Server } from 'socket.io';
<<<<<<< HEAD
import express from 'express';
import mysql from 'mysql2';
import moment from 'moment';

// 创建连接
const connection = mysql.createConnection({
  host: 'pallas.cn',
  user: 'pallas',
  password: '1',
  database: 'pallas'
});

// Promise 方式
// connection.promise()
//   .query('SELECT * FROM app_stock_info')
//   .then(([rows, fields]) => {
//     console.log(rows);
//   })
//   .catch(console.error)
//   .then(() => connection.end());
=======
import express, { response } from 'express';
import  mysql  from 'mysql2/promise';
import moment from 'moment';

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'pallas',
  password: '1',
  database: 'pallas',
  waitForConnections: true,
  connectionLimit: 10
});

// pool.query('SELECT * FROM x_stock').then((data)=>{
//   console.log(data);
// });

>>>>>>> ef4a2885802295fbe077d0f3e562ae79af314cb0

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  maxHttpBufferSize: 1e8, // 增大传输限制 (100MB)
  pingTimeout: 60000,     // 延长超时
  cors: {
    origin: "*",          // 生产环境应限制具体域名
    methods: ["GET", "POST"]
  }
});


async function fetchData(){
  let url = "http://push2.eastmoney.com/api/qt/stock/get?ut=fa5fd1943c7b386f172d6893dbfba10b&invt=2&fltt=2&fields=f43,f57,f58,f169,f170,f46,f44,f51,f168,f47,f164,f163,f116,f60,f45,f52,f50,f48,f167,f117,f71,f161,f49,f530,f135,f136,f137,f138,f139,f141,f142,f144,f145,f147,f148,f140,f143,f146,f149,f55,f62,f162,f92,f173,f104,f105,f84,f85,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f107,f111,f86,f177,f78,f110,f262,f263,f264,f267,f268,f250,f251,f252,f253,f254,f255,f256,f257,f258,f266,f269,f270,f271,f273,f274,f275,f127,f199,f128,f193,f196,f194,f195,f197,f80,f280,f281,f282,f284,f285,f286,f287&secid=106.BABA";

  let resp =await axios.get(url);
  // console.log( JSON.stringify(resp.data) );

  let stockInfo = resp.data.data;

  connection.query(
    `INSERT INTO app_stock_info (gmt_created, gmt_modified, code, name,  content) 
     VALUES (?, ?, ?, ?, ?)`,
    [ new Date(), moment(stockInfo.f86*1000).format("YYYY-MM-DD HH:mm:ss"), stockInfo.f57, stockInfo.f58, JSON.stringify(stockInfo)],
    (err, result) => {
      if (err) throw err;
      // console.log(result.affectedRows > 0 ? '插入或更新成功' : '无变化');
    }
  );

  return stockInfo;
}

// 为每个客户端创建独立的数据推送间隔
const intervalId = setInterval(() => {
  try {
    // const data = generateRealTimeData();
    // const data = Math.random() * 100;

  fetchData().then((data)=>{
    console.log(data.f43)
    // socket.emit('data', data.f43);
  });



  } catch (err) {
    console.error('Emit error:', err);
    clearInterval(intervalId);
  }
}, 1000);

// 模拟实时数据生成
function generateRealTimeData() {
  return {
    timestamp: Date.now(),
    metrics: {
      cpu: Math.random() * 100,
      memory: 30 + Math.random() * 50,
      network: Math.random() * 1000
    },
    dataPoints: Array.from({ length: 100 }, () => Math.random() * 100)
  };
}

async function fetchData() {
  let url ="http://push2.eastmoney.com/api/qt/stock/get?invt=2&fltt=1&fields=f58%2Cf107%2Cf57%2Cf43%2Cf59%2Cf169%2Cf170%2Cf152%2Cf46%2Cf60%2Cf44%2Cf45%2Cf47%2Cf48%2Cf19%2Cf532%2Cf39%2Cf161%2Cf49%2Cf171%2Cf50%2Cf86%2Cf600%2Cf601%2Cf154%2Cf84%2Cf85%2Cf168%2Cf108%2Cf116%2Cf167%2Cf164%2Cf92%2Cf71%2Cf117&secid=106.BABA&ut=fa5fd1943c7b386f172d6893dbfba10b&wbp2u=%7C0%7C0%7C0%7Cweb&_=1664352237239";

  const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json(); // 解析JSON响应
  console.log(data.data.f86)
  console.log(moment(data.data.f86 * 1000).format('YYYY-MM-DD HH:mm:ss'))

  const [result] = await pool.query('INSERT INTO x_stock (gmt_created, gmt_modified, code, name, data) VALUES (?, ?, ?, ?, ?)',
     [  moment().format('YYYY-MM-DD HH:mm:ss') , moment(data.data.f86*1000).format('YYYY-MM-DD HH:mm:ss'), data.data.f57, data.f58, JSON.stringify(data.data)]);


  // console.log(result);

  return data;
}



// 连接处理
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // 为每个客户端创建独立的数据推送间隔
  const intervalId = setInterval(() => {
    try {
      // const data = generateRealTimeData();
      // const data = Math.random() * 100;
<<<<<<< HEAD

    fetchData().then((data)=>{
      // console.log(data.data.f43)
      socket.emit('data', data);
    });

=======
      // socket.emit('data', data);

      fetchData()
      .then((resp)=>{
        // console.log(resp.data)
        socket.emit('data', resp.data);
      })
      .catch((error)=>{
        console.log(error)
      })
      
>>>>>>> ef4a2885802295fbe077d0f3e562ae79af314cb0
    } catch (err) {
      console.error('Emit error:', err);
      clearInterval(intervalId);
    }
  }, 1000);
  
  // 断开连接清理
  socket.on('disconnect', () => {
    clearInterval(intervalId);
    console.log(`Client disconnected: ${socket.id}`);
  });
  
  // 错误处理
  socket.on('error', (err) => {
    console.error('Socket error:', err);
    clearInterval(intervalId);
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Real-time server running on port ${PORT}`);
});

// 导出供测试使用
export { httpServer, io };