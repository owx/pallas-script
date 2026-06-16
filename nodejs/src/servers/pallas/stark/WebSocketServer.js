import { WebSocketServer as WSWebSocketServer } from 'ws';

export class WebSocketServer {
  constructor(port = 3000) {
    this.port = port;
    this.server = null;
    this.clients = new Set();
    this.messageHandlers = [];
    this.connectionHandlers = [];
    this.closeHandlers = [];
  }
  
  // 启动服务器
  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = new WSWebSocketServer({ 
          port: this.port,
          perMessageDeflate: false
        });
        
        this.server.on('listening', () => {
          console.log(`✅ WebSocket服务器运行在端口 ${this.port}`);
          resolve();
        });
        
        this.server.on('error', (error) => {
          console.error('❌ 服务器启动失败:', error);
          reject(error);
        });
        
        this.server.on('connection', (ws, request) => {
          this.handleConnection(ws, request);
        });
        
      } catch (error) {
        console.error('❌ 创建服务器时出错:', error);
        reject(error);
      }
    });
  }
  
  // 处理新连接
  handleConnection(ws, request) {
    // 为每个客户端生成唯一ID
    const clientId = this.generateClientId();
    ws.clientId = clientId;
    ws.ip = request.socket.remoteAddress;
    
    this.clients.add(ws);
    console.log(`🔗 新的客户端连接: ${clientId} (IP: ${ws.ip}), 总连接数: ${this.clients.size}`);
    
    // 调用连接处理器
    this.connectionHandlers.forEach(handler => {
      try {
        handler(ws, request);
      } catch (error) {
        console.error('连接处理器错误:', error);
      }
    });
    
    // 设置消息处理器
    ws.on('message', (data) => {
      this.handleMessage(ws, data);
    });
    
    // 设置关闭处理器
    ws.on('close', (code, reason) => {
      this.handleClose(ws, code, reason);
    });
    
    // 设置错误处理器
    ws.on('error', (error) => {
      console.error(`⚠️ 客户端 ${clientId} 错误:`, error);
    });
  }
  
  // 处理接收到的消息
  handleMessage(ws, data) {
    try {
      let message;
      // 尝试解析JSON，如果不是JSON则作为文本处理
      try {
        message = JSON.parse(data);
      } catch {
        message = {
          type: 'text',
          content: data.toString(),
          timestamp: new Date().toISOString()
        };
      }
      
      console.log(`📨 收到来自 ${ws.clientId} 的消息:`, message);
      
      // 调用消息处理器
      this.messageHandlers.forEach(handler => {
        try {
          handler(ws, message);
        } catch (error) {
          console.error('消息处理器错误:', error);
        }
      });
    } catch (error) {
      console.error('❌ 处理消息时出错:', error);
    }
  }
  
  // 处理连接关闭
  handleClose(ws, code, reason) {
    this.clients.delete(ws);
    console.log(`🔌 客户端 ${ws.clientId} 断开连接, 代码: ${code}, 原因: ${reason || '无'}, 剩余连接数: ${this.clients.size}`);
    
    // 调用关闭处理器
    this.closeHandlers.forEach(handler => {
      try {
        handler(ws, code, reason);
      } catch (error) {
        console.error('关闭处理器错误:', error);
      }
    });
  }
  
  // 生成客户端ID
  generateClientId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  // 广播消息给所有客户端
  broadcast(message) {
    const data = typeof message === 'string' ? message : JSON.stringify(message);
    let sentCount = 0;
    
    this.clients.forEach(client => {
      if (client.readyState === 1) { // OPEN
        try {
          client.send(data);
          sentCount++;
        } catch (error) {
          console.error(`广播消息到客户端 ${client.clientId} 失败:`, error);
        }
      }
    });
    
    console.log(`📢 广播消息给 ${sentCount} 个客户端`);
    return sentCount;
  }
  
  // 发送消息给特定客户端
  sendToClient(ws, message) {
    if (ws.readyState === 1) { // OPEN
      try {
        const data = typeof message === 'string' ? message : JSON.stringify(message);
        ws.send(data);
        return true;
      } catch (error) {
        console.error(`发送消息到客户端 ${ws.clientId} 失败:`, error);
        return false;
      }
    }
    return false;
  }
  
  // 通过客户端ID发送消息
  sendToClientById(clientId, message) {
    for (const client of this.clients) {
      if (client.clientId === clientId && client.readyState === 1) {
        try {
          const data = typeof message === 'string' ? message : JSON.stringify(message);
          client.send(data);
          return true;
        } catch (error) {
          console.error(`发送消息到客户端 ${clientId} 失败:`, error);
          return false;
        }
      }
    }
    console.log(`❌ 未找到客户端 ${clientId} 或客户端未连接`);
    return false;
  }
  
  // 注册消息处理器
  onMessage(handler) {
    this.messageHandlers.push(handler);
    return this; // 支持链式调用
  }
  
  // 注册连接处理器
  onConnection(handler) {
    this.connectionHandlers.push(handler);
    return this; // 支持链式调用
  }
  
  // 注册关闭处理器
  onClose(handler) {
    this.closeHandlers.push(handler);
    return this; // 支持链式调用
  }
  
  // 停止服务器
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        console.log('🛑 正在关闭WebSocket服务器...');
        
        // 关闭所有客户端连接
        this.clients.forEach(client => {
          try {
            client.close(1000, 'Server shutdown');
          } catch (error) {
            console.error('关闭客户端连接时出错:', error);
          }
        });
        
        this.server.close(() => {
          console.log('✅ WebSocket服务器已停止');
          this.server = null;
          this.clients.clear();
          resolve();
        });
      } else {
        console.log('ℹ️ 服务器未运行');
        resolve();
      }
    });
  }
  
  // 获取客户端数量
  getClientCount() {
    return this.clients.size;
  }
  
  // 获取所有客户端信息
  getClientsInfo() {
    const clientsInfo = [];
    this.clients.forEach(client => {
      clientsInfo.push({
        clientId: client.clientId,
        ip: client.ip,
        readyState: this.getReadyStateName(client.readyState)
      });
    });
    return clientsInfo;
  }
  
  // 获取连接状态名称
  getReadyStateName(state) {
    const states = {
      0: 'CONNECTING',
      1: 'OPEN',
      2: 'CLOSING',
      3: 'CLOSED'
    };
    return states[state] || 'UNKNOWN';
  }
}

export default WebSocketServer;