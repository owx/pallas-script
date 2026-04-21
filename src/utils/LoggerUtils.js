// src/utils/logger.js
import log4js from 'log4js';
import path from 'path';
import fs from 'fs';

class Logger {
    constructor(options = {}) {
        this.config = this.mergeConfig(options);
        this.initialize();
        this.loggers = new Map(); // 缓存不同模块的 logger 实例
    }

    /**
     * 默认配置
     */
    getDefaultConfig() {
        const LOG_BASE_DIR = path.join(process.cwd(), 'logs');
        
        // 确保日志目录存在
        ['info', 'error', 'debug'].forEach(dir => {
            const fullPath = path.join(LOG_BASE_DIR, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        });

        return {
            baseDir: LOG_BASE_DIR,
            pattern: 'yyyy-MM-dd.log',
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %c - %m'
            },
            levels: {
                info: 'info',
                error: 'error',
                debug: 'debug'
            }
        };
    }

    /**
     * 合并用户配置
     */
    mergeConfig(userConfig) {
        const defaultConfig = this.getDefaultConfig();
        return {
            ...defaultConfig,
            ...userConfig,
            levels: {
                ...defaultConfig.levels,
                ...(userConfig.levels || {})
            }
        };
    }

    /**
     * 构建 log4js 配置
     */
    buildLog4jsConfig() {
        const { baseDir, pattern, layout, levels } = this.config;
        
        const appenders = {
            // 控制台输出
            console: {
                type: 'console',
                layout: layout
            }
        };

        const categories = {};

        // 为每个级别创建 appender 和 category
        Object.keys(levels).forEach(level => {
            const levelName = level;
            const appenderName = levelName;
            
            // 创建文件 appender
            appenders[appenderName] = {
                type: 'dateFile',
                filename: path.join(baseDir, levelName, levelName),
                pattern: pattern,
                alwaysIncludePattern: true,
                layout: layout,
                // 可选：设置文件压缩
                compress: false,
                // 可选：保留文件数量
                keepFileExt: true,
                numBackups: 30
            };

            // 创建 category
            categories[levelName] = {
                appenders: ['console', appenderName],
                level: levels[levelName]
            };
        });

        // 添加默认 category
        categories.default = {
            appenders: ['console', 'info'],
            level: levels.info
        };

        return { appenders, categories };
    }

    /**
     * 初始化 log4js
     */
    initialize() {
        const log4jsConfig = this.buildLog4jsConfig();
        log4js.configure(log4jsConfig);
        
        // 获取默认 logger
        this.defaultLogger = log4js.getLogger();
    }

    /**
     * 获取指定模块的 logger 实例（支持缓存）
     * @param {string} moduleName 模块名称
     * @returns {object} logger 实例
     */
    getLogger(moduleName = 'default') {
        if (!this.loggers.has(moduleName)) {
            const logger = log4js.getLogger(moduleName);
            this.loggers.set(moduleName, logger);
        }
        return this.loggers.get(moduleName);
    }

    /**
     * 记录 info 日志
     * @param {string} message 日志消息
     * @param {object|any} meta 附加元数据
     * @param {string} module 模块名称
     */
    info(message, meta = null, module = 'default') {
        const logger = this.getLogger(module);
        if (meta) {
            logger.info(message, meta);
        } else {
            logger.info(message);
        }
    }

    /**
     * 记录 error 日志
     * @param {string|Error} message 错误消息或 Error 对象
     * @param {object|any} meta 附加元数据
     * @param {string} module 模块名称
     */
    error(message, meta = null, module = 'default') {
        const logger = this.getLogger(module);
        if (message instanceof Error) {
            logger.error(message.message, { 
                stack: message.stack,
                ...meta 
            });
        } else if (meta) {
            logger.error(message, meta);
        } else {
            logger.error(message);
        }
    }

    /**
     * 记录 debug 日志（仅在开发环境生效）
     * @param {string} message 日志消息
     * @param {object|any} meta 附加元数据
     * @param {string} module 模块名称
     */
    debug(message, meta = null, module = 'default') {
        if (process.env.NODE_ENV !== 'production') {
            const logger = this.getLogger(module);
            if (meta) {
                logger.debug(message, meta);
            } else {
                logger.debug(message);
            }
        }
    }

    /**
     * 记录 warn 日志
     * @param {string} message 日志消息
     * @param {object|any} meta 附加元数据
     * @param {string} module 模块名称
     */
    warn(message, meta = null, module = 'default') {
        const logger = this.getLogger(module);
        if (meta) {
            logger.warn(message, meta);
        } else {
            logger.warn(message);
        }
    }

    /**
     * 记录 fatal 日志
     * @param {string|Error} message 错误消息或 Error 对象
     * @param {object|any} meta 附加元数据
     * @param {string} module 模块名称
     */
    fatal(message, meta = null, module = 'default') {
        const logger = this.getLogger(module);
        if (message instanceof Error) {
            logger.fatal(message.message, { 
                stack: message.stack,
                ...meta 
            });
        } else if (meta) {
            logger.fatal(message, meta);
        } else {
            logger.fatal(message);
        }
    }

    /**
     * 动态调整日志级别
     * @param {string} category 类别名称
     * @param {string} level 新的日志级别
     */
    setLevel(category, level) {
        const logger = this.getLogger(category);
        logger.level = level;
    }

    /**
     * 创建 Express/Koa 中间件
     * @returns {Function} Express 中间件函数
     */
    createExpressMiddleware() {
        return (req, res, next) => {
            const start = Date.now();
            const module = `http.${req.method}`;
            
            // 记录请求开始
            this.debug(`${req.method} ${req.url} - 请求开始`, null, module);
            
            // 监听响应结束
            res.on('finish', () => {
                const duration = Date.now() - start;
                const logLevel = res.statusCode >= 400 ? 'error' : 'info';
                const message = `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`;
                
                if (logLevel === 'error') {
                    this.error(message, { 
                        statusCode: res.statusCode,
                        duration,
                        userAgent: req.get('user-agent')
                    }, module);
                } else {
                    this.info(message, {
                        statusCode: res.statusCode,
                        duration
                    }, module);
                }
            });
            
            next();
        };
    }

    /**
     * 关闭日志系统（优雅退出时调用）
     */
    shutdown(callback) {
        log4js.shutdown(callback);
    }
}
export default Logger;

// 创建单例实例
// export const loggerInstance = new LoggerService();
// export const loggerInstance = new Logger({ layout: {type: 'pattern', pattern: '%m'} });

// 导出单例和类
// module.exports = {
//     LoggerService,
//     logger: loggerInstance
// };