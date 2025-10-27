import express, { json } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
// import WebSocket from 'ws';
import axios from 'axios';
import mysql from 'mysql2/promise';

import { fetchRealTimeData } from './stock.js';
import { initDB, fetchHistoryData, saveData } from './storage.js';

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

// 定时获取并广播数据
async function updateAndBroadcastStockData() {
  // console.log("updateAndBroadcastStockData >>")
  const updates = [];
  
  for (const symbol of stockCodes) {
    const data = await fetchRealTimeData();

    console.log( JSON.stringify(data.data))

    if (data) {
      const stock = data.data;

      await saveData(stock);
      
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