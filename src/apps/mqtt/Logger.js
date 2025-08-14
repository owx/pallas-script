const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

class Logger {
  constructor(logDir = 'logs') {
    this.logDir = path.join(__dirname, logDir);
    this.ensureLogDirectoryExists();
    this.currentLogFile = this.getLogFilePath();
  }
  
  ensureLogDirectoryExists() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }
  
  getLogFilePath() {
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    return path.join(this.logDir, `${dateStr}.log`);
  }
  
  log(level, message) {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    fs.appendFile(this.currentLogFile, logMessage, (err) => {
      if (err) console.error('日志写入失败:', err);
    });
    
    // 同时在控制台输出
    console.log(logMessage.trim());
  }
  
  info(message) {
    this.log('info', message);
  }
  
  error(message) {
    this.log('error', message);
  }
  
  warn(message) {
    this.log('warn', message);
  }
}