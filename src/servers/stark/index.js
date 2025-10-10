import StockDataService from './StockDataService.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// ES模块中获取__dirname的等效方法
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 创建服务实例
const stockService = new StockDataService({
  updateInterval: 1000, // 1秒更新一次
  maxRetries: 3,
  retryDelay: 2000
});

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'pallas',
  password: process.env.DB_PASSWORD || '1',
  database: process.env.DB_NAME || 'pallas',
  port: process.env.DB_PORT || 3306
};

// RESTful API 路由
app.get('/api/stocks', async (req, res) => {
  try {
    const stocks = stockService.getAllStocks();
    res.json({
      success: true,
      data: stocks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/stocks/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { market = '0' } = req.query;
    
    const stock = stockService.getStock(code, market);
    if (stock) {
      res.json({
        success: true,
        data: stock
      });
    } else {
      res.status(404).json({
        success: false,
        error: '股票未找到'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/stocks/subscribe', async (req, res) => {
  try {
    const { stocks } = req.body;
    
    if (!stocks || !Array.isArray(stocks)) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的股票列表'
      });
    }
    
    stocks.forEach(stock => {
      stockService.addStock(stock.code, stock.market);
    });
    
    res.json({
      success: true,
      message: `成功订阅 ${stocks.length} 只股票`,
      subscribed: stocks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 添加历史数据API路由
app.get('/api/stocks/:code/history', async (req, res) => {
  try {
    const { code } = req.params;
    const { hours = '24', type = 'minute' } = req.query;
    
    const historyData = await stockService.getStockHistory(code, parseInt(hours));
    
    res.json({
      success: true,
      data: historyData,
      stockCode: code,
      period: `${hours}小时`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 实时数据流API (Server-Sent Events)
app.get('/api/stocks/:code/stream', async (req, res) => {
  try {
    const { code } = req.params;
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // 发送初始数据
    const initialHistory = await stockService.getStockHistory(code, 1); // 最近1小时数据
    res.write(`data: ${JSON.stringify({
      type: 'initial',
      data: initialHistory
    })}\n\n`);

    // 监听股票更新事件
    const handleStockUpdate = (stockData) => {
      if (stockData.stockCode === code) {
        res.write(`data: ${JSON.stringify({
          type: 'update',
          data: {
            timestamp: stockData.timestamp,
            time: new Date(stockData.timestamp).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            price: stockData.currentPrice,
            volume: stockData.volume
          }
        })}\n\n`);
      }
    };

    stockService.on('stockUpdate', handleStockUpdate);

    // 客户端断开连接时清理
    req.on('close', () => {
      stockService.removeListener('stockUpdate', handleStockUpdate);
      res.end();
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Stock Data Service',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    monitoredStocks: stockService.stocks.size
  });
});

// 提供客户端页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务
async function startServer() {
  try {
    console.log('🚀 启动股票实时数据服务...');
    
    // 初始化数据库
    const dbInitialized = await stockService.initDatabase(dbConfig);
    if (!dbInitialized) {
      console.error('❌ 数据库初始化失败，服务启动中止');
      process.exit(1);
    }
    
    // 添加示例股票
    stockService
      .addStock('000001', '0') // 平安银行
      .addStock('600036', '1') // 招商银行
      .addStock('000858', '0') // 五粮液
      .addStock('601318', '1') // 中国平安
      .addStock('300750', '0') // 宁德时代
      .addStock('000333', '0'); // 美的集团
    
    // 初始化WebSocket服务器
    stockService.initWebSocketServer(8080);
    
    // 启动股票数据更新服务
    await stockService.start();
    
    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`✅ HTTP服务器运行在 http://localhost:${PORT}`);
      console.log(`✅ WebSocket服务器运行在 ws://localhost:8080`);
      console.log(`✅ 监控股票数量: ${stockService.stocks.size}`);
      console.log('📊 服务已就绪，开始获取实时数据...');
    });
    
  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n🛑 收到关闭信号，正在优雅停止服务...');
  stockService.stop();
  setTimeout(() => {
    console.log('✅ 服务已停止');
    process.exit(0);
  }, 1000);
});

process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
});

// 启动服务
startServer();