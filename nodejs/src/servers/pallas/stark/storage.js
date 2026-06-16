import mysql from 'mysql2/promise';

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
export async function initDB() {
  pool = mysql.createPool(dbConfig);
  
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


// 存储股票数据到数据库
export async function saveData(data) {
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

export async function fetchHistoryData(params){

  const now = Date.now();
  let duration = params?.duration || 60;
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

