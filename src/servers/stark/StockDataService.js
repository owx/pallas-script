import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';
import mysql from 'mysql2/promise';
import axios from 'axios';

class StockDataService extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      updateInterval: options.updateInterval || 10000,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 2000,
      ...options
    };
    
    this.stocks = new Map();
    this.isRunning = false;
    this.retryCount = 0;
    this.dbPool = null;
    this.wss = null;
    this.updateInterval = null;
    
    // 创建axios实例，配置超时和重试
    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
  }

  // 初始化数据库连接
  async initDatabase(dbConfig) {
    try {
      this.dbPool = mysql.createPool({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        port: dbConfig.port,
        connectionLimit: 10,
        acquireTimeout: 60000,
        reconnect: true,
        timezone: '+08:00'
      });

      // 测试连接
      await this.dbPool.getConnection();
      console.log('✅ 数据库连接成功');
      
      // 创建数据表
      await this.createTables();
      return true;
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
  }

  // 创建数据表
  async createTables() {
    try {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS stock_realtime_data (
          id INT AUTO_INCREMENT PRIMARY KEY,
          stock_code VARCHAR(20) NOT NULL,
          stock_name VARCHAR(100),
          current_price DECIMAL(10,2),
          yesterday_close DECIMAL(10,2),
          today_open DECIMAL(10,2),
          today_high DECIMAL(10,2),
          today_low DECIMAL(10,2),
          volume BIGINT,
          turnover DECIMAL(15,2),
          change_amount DECIMAL(10,2),
          change_rate DECIMAL(8,4),
          market_cap DECIMAL(15,2),
          circulating_cap DECIMAL(15,2),
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_stock_code (stock_code),
          INDEX idx_timestamp (timestamp),
          UNIQUE KEY unique_stock_timestamp (stock_code, timestamp)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;

      await this.dbPool.execute(createTableSQL);
      console.log('✅ 数据表初始化完成');
    } catch (error) {
      console.error('❌ 创建数据表失败:', error);
      throw error;
    }
  }

  // 初始化WebSocket服务器
  initWebSocketServer(port = 8080) {
    try {
      this.wss = new WebSocketServer({ 
        port,
        perMessageDeflate: false
      });
      
      this.wss.on('connection', (ws, req) => {
        const clientIp = req.socket.remoteAddress;
        console.log(`📡 新的WebSocket连接来自: ${clientIp}`);
        
        // 发送当前所有股票数据
        this.sendAllStocksToClient(ws);
        
        ws.on('message', (message) => {
          this.handleClientMessage(ws, message);
        });
        
        ws.on('close', () => {
          console.log(`📡 WebSocket连接关闭: ${clientIp}`);
        });
        
        ws.on('error', (error) => {
          console.error(`📡 WebSocket错误 ${clientIp}:`, error);
        });
      });
      
      console.log(`✅ WebSocket服务器启动在端口 ${port}`);
    } catch (error) {
      console.error('❌ WebSocket服务器启动失败:', error);
      throw error;
    }
  }

  // 从东方财富API获取股票数据
  async fetchStockData(secid) {
    const url = 'http://push2.eastmoney.com/api/qt/stock/get';
    const params = {
      secid: secid,
      fields: 'f57,f58,f43,f60,f44,f45,f46,f47,f48,f169,f170,f84,f116,f117',
      ut: 'fa077fd5b9a9c22c6a68a7a5c7a7b29f',
      fltt: '2',
      invt: '2',
    };

    try {
      const response = await this.httpClient.get(url, { params });
      
      if (response.data && response.data.data) {
        const rawData = response.data.data;
        
        // 检查数据是否有效
        if (rawData.f57 && rawData.f58) {
          return this.processStockData(rawData);
        } else {
          throw new Error('API返回数据不完整');
        }
      } else {
        throw new Error('API返回数据格式错误');
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('请求超时');
      } else if (error.response) {
        throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
      } else {
        throw new Error(`网络错误: ${error.message}`);
      }
    }
  }

  // 处理股票数据
  processStockData(rawData) {
    const priceFields = ['f43', 'f44', 'f45', 'f46', 'f60'];
    const processedData = { ...rawData };
  
    priceFields.forEach(field => {
      if (processedData[field] != null) {
        // processedData[field] = processedData[field] / 100.0;
      }
    });
  
    return {
      stockCode: processedData.f57,
      stockName: processedData.f58,
      currentPrice: processedData.f43,
      yesterdayClose: processedData.f60,
      todayOpen: processedData.f46,
      todayHigh: processedData.f44,
      todayLow: processedData.f45,
      volume: processedData.f47,
      turnover: processedData.f48,
      changeAmount: processedData.f170,
      changeRate: processedData.f169 / 100,
      marketCap: processedData.f84,
      circulatingCap: processedData.f117,
      timestamp: new Date(),
      // 添加分钟级时间戳用于图表
      minuteTimestamp: new Date().toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
    };
  }

  async getStockHistory(stockCode, hours = 24) {
    if (!this.dbPool) {
      throw new Error('数据库未连接');
    }
  
    try {
      const sql = `
        SELECT 
          stock_code,
          current_price,
          volume,
          timestamp,
          DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:00') as minute_time
        FROM stock_realtime_data 
        WHERE stock_code = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        ORDER BY timestamp ASC
      `;
  
      const [rows] = await this.dbPool.execute(sql, [stockCode, hours]);
      
      // 按分钟聚合数据，减少数据点数量
      const minuteData = new Map();
      
      rows.forEach(row => {
        const minuteKey = row.minute_time;
        if (!minuteData.has(minuteKey)) {
          minuteData.set(minuteKey, {
            timestamp: row.timestamp,
            time: new Date(row.timestamp).toLocaleTimeString('zh-CN', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            price: row.current_price,
            volume: row.volume,
            count: 1
          });
        } else {
          const existing = minuteData.get(minuteKey);
          // 使用最新价格，累计成交量
          existing.price = row.current_price;
          existing.volume += row.volume;
          existing.count += 1;
        }
      });
  
      return Array.from(minuteData.values()).map(item => ({
        timestamp: item.timestamp,
        time: item.time,
        price: item.price,
        volume: Math.round(item.volume / item.count) // 平均成交量
      }));
    } catch (error) {
      console.error('获取历史数据失败:', error);
      throw error;
    }
  }
  

  // 存储数据到数据库
  async saveToDatabase(stockData) {
    if (!this.dbPool) {
      return;
    }
  
    try {
      const sql = `
        INSERT INTO stock_realtime_data 
        (stock_code, stock_name, current_price, yesterday_close, today_open, 
         today_high, today_low, volume, turnover, change_amount, change_rate,
         market_cap, circulating_cap, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      const values = [
        stockData.stockCode,
        stockData.stockName,
        stockData.currentPrice,
        stockData.yesterdayClose,
        stockData.todayOpen,
        stockData.todayHigh,
        stockData.todayLow,
        stockData.volume,
        stockData.turnover,
        stockData.changeAmount,
        stockData.changeRate,
        stockData.marketCap,
        stockData.circulatingCap,
        stockData.timestamp
      ];
  
      await this.dbPool.execute(sql, values);
    } catch (error) {
      // 忽略重复键错误
      if (error.code !== 'ER_DUP_ENTRY') {
        console.error('💾 存储数据失败:', error.message);
      }
    }
  }

  // 向所有客户端广播数据
  broadcastToClients(stockData) {
    if (!this.wss || this.wss.clients.size === 0) return;

    const message = JSON.stringify({
      type: 'stock_update',
      data: stockData,
      timestamp: new Date().toISOString()
    });

    let sentCount = 0;
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message, (error) => {
          if (error) {
            console.error('📡 发送消息到客户端失败:', error);
          }
        });
        sentCount++;
      }
    });
    
    if (sentCount > 0) {
      console.log(`📡 向 ${sentCount} 个客户端推送了 ${stockData.stockCode} 的数据`);
    }
  }

  // 更新所有股票数据
  async updateAllStocks() {
    if (this.stocks.size === 0) {
      return;
    }

    console.log(`🔄 开始更新 ${this.stocks.size} 只股票数据...`);
    const startTime = Date.now();

    const updatePromises = Array.from(this.stocks.keys()).map(async (secid) => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100)); // 简单限流
        
        const stockData = await this.fetchStockData(secid);
        const stock = this.stocks.get(secid);
        
        stock.data = stockData;
        stock.lastUpdate = new Date();
        
        // 存储到数据库
        await this.saveToDatabase(stockData);
        
        // 广播给客户端
        this.broadcastToClients(stockData);
        
        // 触发事件
        this.emit('stockUpdate', stockData);
        
        return stockData;
      } catch (error) {
        console.error(`❌ 更新 ${secid} 失败:`, error.message);
        return null;
      }
    });

    const results = await Promise.allSettled(updatePromises);
    const successfulUpdates = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
    const failedUpdates = this.stocks.size - successfulUpdates;
    
    const duration = Date.now() - startTime;
    console.log(`✅ 更新完成: ${successfulUpdates} 成功, ${failedUpdates} 失败, 耗时: ${duration}ms`);
    
    // 重置重试计数
    this.retryCount = 0;
  }

  // 启动服务
  async start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    console.log('🎯 启动股票数据更新服务...');

    // 立即执行一次更新
    await this.updateAllStocks();

    // 设置定时更新
    this.updateInterval = setInterval(async () => {
      await this.updateAllStocks();
    }, this.options.updateInterval);

    this.emit('serviceStarted');
    console.log(`🕒 数据更新服务已启动，间隔: ${this.options.updateInterval}ms`);
  }

  // 停止服务
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    if (this.wss) {
      this.wss.close();
      console.log('📡 WebSocket服务器已关闭');
    }
    
    if (this.dbPool) {
      this.dbPool.end();
      console.log('💾 数据库连接已关闭');
    }
    
    console.log('🛑 股票数据服务已停止');
    this.emit('serviceStopped');
  }

  // 添加要监控的股票
  addStock(stockCode, marketCode = '0') {
    const secid = `${marketCode}.${stockCode}`;
    if (!this.stocks.has(secid)) {
      this.stocks.set(secid, {
        secid,
        stockCode,
        marketCode,
        lastUpdate: null,
        data: null
      });
      console.log(`✅ 添加股票监控: ${stockCode} (${secid})`);
    }
    return this;
  }

  // 批量添加股票
  addStocks(stockList) {
    stockList.forEach(stock => {
      this.addStock(stock.code, stock.market);
    });
    return this;
  }

  // 向单个客户端发送所有股票数据
  sendAllStocksToClient(ws) {
    const allStocks = Array.from(this.stocks.values())
      .filter(stock => stock.data)
      .map(stock => stock.data);

    if (allStocks.length > 0) {
      const message = JSON.stringify({
        type: 'all_stocks',
        data: allStocks,
        timestamp: new Date().toISOString()
      });
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }

  // 处理客户端消息
  handleClientMessage(ws, message) {
    try {
      const parsed = JSON.parse(message);
      
      switch (parsed.type) {
        case 'subscribe':
          if (parsed.stocks && Array.isArray(parsed.stocks)) {
            parsed.stocks.forEach(stock => {
              this.addStock(stock.code, stock.market);
            });
          }
          break;
          
        case 'request_history':
          this.sendHistoryData(ws, parsed.stockCode, parsed.days);
          break;
          
        default:
          console.log('未知的客户端消息类型:', parsed.type);
      }
    } catch (error) {
      console.error('处理客户端消息失败:', error);
    }
  }

  // 发送历史数据给客户端
  async sendHistoryData(ws, stockCode, days = 7) {
    if (!this.dbPool) return;

    try {
      const sql = `
        SELECT * FROM stock_realtime_data 
        WHERE stock_code = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
        ORDER BY timestamp DESC
        LIMIT 1000
      `;

      const [rows] = await this.dbPool.execute(sql, [stockCode, days]);
      
      const message = JSON.stringify({
        type: 'history_data',
        stockCode: stockCode,
        data: rows,
        timestamp: new Date().toISOString()
      });

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    } catch (error) {
      console.error('获取历史数据失败:', error);
    }
  }

  // 获取当前所有股票数据
  getAllStocks() {
    return Array.from(this.stocks.values())
      .filter(stock => stock.data)
      .map(stock => stock.data);
  }

  // 获取特定股票数据
  getStock(stockCode, marketCode = '0') {
    const secid = `${marketCode}.${stockCode}`;
    const stock = this.stocks.get(secid);
    return stock ? stock.data : null;
  }
}

export default StockDataService;