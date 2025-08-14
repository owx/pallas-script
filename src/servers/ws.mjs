// server.mjs
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';

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

// 模拟实时数据生成
function generateRealTimeData() {
  return {
    time: Date.now(),
    value: Math.random() * 100,

    // timestamp: Date.now(),
    // metrics: {
    //   cpu: Math.random() * 100,
    //   memory: 30 + Math.random() * 50,
    //   network: Math.random() * 1000
    // },
    // dataPoints: Array.from({ length: 100 }, () => Math.random() * 100)
  };
}

// 连接处理
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // 为每个客户端创建独立的数据推送间隔
  const intervalId = setInterval(() => {
    try {
      // const data = generateRealTimeData();
      const data = Math.random() * 100;
      socket.emit('data', data);
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