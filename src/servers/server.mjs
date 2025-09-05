import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
// import WebSocket from 'ws';
import axios from 'axios';
import mysql from 'mysql2/promise';

// 模拟股票代码列表
// const stockCodes = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
const stockCodes = ['BABA'];

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

let sockList=[];

// 数据库配置
const dbConfig = {
  host: 'pallas.cn',
  user: 'pallas',
  password: '1',
  database: 'pallas'
};
// const conn = mysql.createConnection(dbConfig);

// const app = express();
// const PORT = 3000;

// // 创建HTTP服务器
// const server = app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // 创建WebSocket服务器
// const wss = new WebSocket.Server({ server });


// 连接池
let pool;

// 初始化数据库连接
async function initDB() {
  pool = await mysql.createPool(dbConfig);
  
  // 创建表
  // await pool.query(`
  //   CREATE TABLE IF NOT EXISTS stock_prices (
  //     id INT AUTO_INCREMENT PRIMARY KEY,
  //     symbol VARCHAR(10) NOT NULL,
  //     price DECIMAL(10,2) NOT NULL,
  //     volume INT NOT NULL,
  //     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  //     INDEX (symbol),
  //     INDEX (timestamp)
  //   )
  // `);
}

// 获取股票实时数据（模拟实现，实际中可以使用第三方API）
async function fetchStockData(symbol) {
  try {
    // const url = "http://push2.eastmoney.com/api/qt/stock/get?ut=fa5fd1943c7b386f172d6893dbfba10b&invt=2&fltt=2&fields=f43,f57,f58,f169,f170,f46,f44,f51,f168,f47,f164,f163,f116,f60,f45,f52,f50,f48,f167,f117,f71,f161,f49,f530,f135,f136,f137,f138,f139,f141,f142,f144,f145,f147,f148,f140,f143,f146,f149,f55,f62,f162,f92,f173,f104,f105,f84,f85,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f107,f111,f86,f177,f78,f110,f262,f263,f264,f267,f268,f250,f251,f252,f253,f254,f255,f256,f257,f258,f266,f269,f270,f271,f273,f274,f275,f127,f199,f128,f193,f196,f194,f195,f197,f80,f280,f281,f282,f284,f285,f286,f287&secid=106.BABA";
    const url = "http://push2.eastmoney.com/api/qt/stock/get?ut=fa5fd1943c7b386f172d6893dbfba10b&invt=2&fltt=2&fields=f43,f57,f58,f169,f170,f46,f44,f51,f168,f47,f164,f163,f116,f60,f45,f52,f50,f48,f167,f117,f71,f161,f49,f530,f135,f136,f137,f138,f139,f141,f142,f144,f145,f147,f148,f140,f143,f146,f149,f55,f62,f162,f92,f173,f104,f105,f84,f85,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f107,f111,f86,f177,f78,f110,f262,f263,f264,f267,f268,f250,f251,f252,f253,f254,f255,f256,f257,f258,f266,f269,f270,f271,f273,f274,f275,f127,f199,f128,f193,f196,f194,f195,f197,f80,f280,f281,f282,f284,f285,f286,f287&secid=106.BABA";

    // 实际项目中替换为真实的股票API
    const response = await axios.get(url);
    return response.data;
    
    // 模拟数据
    // return {
    //   symbol,
    //   price: (Math.random() * 1000).toFixed(2),
    //   volume: Math.floor(Math.random() * 1000000)
    // };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return null;
  }
}

// 存储股票数据到数据库
async function storeStockData(data) {
  try {
    await pool.query(
      `INSERT INTO app_stock_info (gmt_created, gmt_modified, code, name,  content) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        new Date(), 
        // new Date(), 
        new Date(data.f86 * 1000), 
        data.f57,
        data.f58,
        JSON.stringify(data),
      ]
    );
  } catch (error) {
    console.error('Error storing stock data:', error);
  }
}

// 定时获取并广播股票数据
async function updateAndBroadcastStockData() {
  const updates = [];
  
  for (const symbol of stockCodes) {
    const data = await fetchStockData(symbol);
    if (data) {
      const stock = data.data;
      await storeStockData(stock);
      
      updates.push(stock);
      sockList.map((sock)=>{
        sock?.emit('data', updates);
        // sock?.emit('data', {
        //   f86: Date.now()/1000,
        //   f43: stock.f43,
        // });
      })
    }
  }
  
  // 广播给所有连接的客户端
  // sockList.map((sock)=>{
  //   sock?.emit('data', updates);
  // })

  // wss.clients.forEach(client => {
  //   if (client.readyState === WebSocket.OPEN) {
  //     client.send(JSON.stringify({
  //       type: 'update',
  //       data: updates
  //     }));
  //   }
  // });
}

async function fetchHistory(params){

  const now = Date.now();
  let duration = params.duration || 60;
  const milliseconds =  duration * 1000; // 秒转毫秒
  const time = new Date(now - milliseconds);

  const [rows] = await pool.query(
    'SELECT * FROM app_stock_info WHERE code = ? AND gmt_modified > ? ORDER by id ASC ',
    [
      params.code,
      time,
    ]
  );

  return rows;
}

// WebSocket连接处理
// wss.on('connection', (ws) => {
//   console.log('New client connected');
  
//   ws.on('close', () => {
//     console.log('Client disconnected');
//   });
// });

// 初始化数据库并开始定时更新
initDB().then(() => {
  // 每5秒更新一次数据
  setInterval(updateAndBroadcastStockData, 1000);
  console.log('Stock data service started');
});

// HTTP接口获取历史数据
app.get('/api/history/:symbol', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM stock_prices WHERE symbol = ? ORDER BY timestamp DESC LIMIT 100',
      [req.params.symbol]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// 连接处理
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  fetchHistory({code: 'BABA', duration: 10}).then((data)=>{
    socket.emit('data', data.map(item=>JSON.parse(item.content)));
  })

  sockList.push(socket);
  
  // 断开连接清理
  socket.on('disconnect', () => {
    // clearInterval(intervalId);
    sockList.filter((sock)=>sock.id !== socket.id);
    console.log(`Client disconnected: ${socket.id}`);
  });
  
  // 错误处理
  socket.on('error', (err) => {
    sockList.filter((sock)=>sock.id !== socket.id);
    console.error('Socket error:', err);
    // clearInterval(intervalId);
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Real-time server running on port ${PORT}`);
});