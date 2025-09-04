// server.mjs
import { createServer } from 'http';
import { Server } from 'socket.io';
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
      // socket.emit('data', data);

      fetchData()
      .then((resp)=>{
        // console.log(resp.data)
        socket.emit('data', resp.data);
      })
      .catch((error)=>{
        console.log(error)
      })
      
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