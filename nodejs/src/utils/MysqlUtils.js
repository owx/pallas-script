// import mysql from 'mysql2/promise';

class MysqlUtils {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * 基础动态插入
   */
  async insert(table, data, options = {}) {
    const connection = await this.pool.getConnection();
    
    try {
      // 过滤数据
      const filteredData = this._filterData(data, options.filter);
      
      if (Object.keys(filteredData).length === 0) {
        throw new Error('没有有效数据可插入');
      }
      
      const columns = Object.keys(filteredData);
      const values = Object.values(filteredData);
      
      // 构建 SQL
      const sql = this._buildInsertSQL(table, columns, options);
      
      // 执行查询
      const [result] = await connection.execute(sql, values);
      
      return {
        success: true,
        insertId: result.insertId,
        affectedRows: result.affectedRows,
        warningStatus: result.warningStatus
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    } finally {
      connection.release();
    }
  }

  /**
   * 批量动态插入
   */
  async batchInsert(table, dataArray, options = {}) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return { success: false, error: '数据数组不能为空' };
    }
    
    const connection = await this.pool.getConnection();
    
    try {
      // 处理每行数据
      const processedData = dataArray.map(item => 
        this._filterData(item, options.filter)
      );
      
      // 获取所有字段（并集）
      const allFields = [...new Set(
        processedData.flatMap(item => Object.keys(item))
      )];
      
      if (allFields.length === 0) {
        throw new Error('没有有效字段');
      }
      
      // 准备数据和参数
      const values = [];
      const placeholders = [];
      
      processedData.forEach(item => {
        const rowValues = allFields.map(field => 
          item[field] !== undefined ? item[field] : null
        );
        values.push(...rowValues);
        placeholders.push(`(${allFields.map(() => '?').join(', ')})`);
      });
      
      // 构建 SQL
      const columns = allFields.map(field => `\`${field}\``).join(', ');
      const sql = `INSERT INTO \`${table}\` (${columns}) VALUES ${placeholders.join(', ')}`;
      
      // 执行
      const [result] = await connection.execute(sql, values);
      
      return {
        success: true,
        insertId: result.insertId,
        affectedRows: result.affectedRows,
        warningStatus: result.warningStatus
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    } finally {
      connection.release();
    }
  }

  /**
   * 查询单条记录
   * @param {string} table 表名
   * @param {Object} conditions 查询条件
   * @param {Array|string} fields 查询字段
   */
  async findOne(table, conditions = {}, options = {}) {
    const {
      fields = '*',
      orderBy = null,
      forUpdate = false
    } = options;
    
    const connection = await this.pool.getConnection();
    
    try {
      const { whereClause, values } = this._buildWhereClause(conditions);
      const fieldList = Array.isArray(fields) 
        ? fields.map(f => `\`${f}\``).join(', ')
        : fields;
      
      let sql = `SELECT ${fieldList} FROM \`${table}\``;
      if (whereClause) {
        sql += ` WHERE ${whereClause}`;
      }
      
      if (orderBy) {
        sql += ` ORDER BY ${orderBy}`;
      }
      
      sql += ' LIMIT 1';
      
      if (forUpdate) {
        sql += ' FOR UPDATE';
      }
      
      const [rows] = await connection.execute(sql, values);
      
      return {
        success: true,
        data: rows[0] || null,
        found: rows.length > 0
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code,
        data: null
      };
    } finally {
      connection.release();
    }
  }

  /**
   * 查询多条记录
   */
  async find(table, conditions = {}, options = {}) {
    const {
      fields = '*',
      orderBy = null,
      limit = null,
      offset = 0,
      groupBy = null,
      having = null
    } = options;
    
    const connection = await this.pool.getConnection();
    
    try {
      const { whereClause, values } = this._buildWhereClause(conditions);
      const fieldList = Array.isArray(fields) 
        ? fields.map(f => `\`${f}\``).join(', ')
        : fields;
      
      let sql = `SELECT ${fieldList} FROM \`${table}\``;
      if (whereClause) {
        sql += ` WHERE ${whereClause}`;
      }
      
      if (groupBy) {
        sql += ` GROUP BY ${groupBy}`;
        if (having) {
          sql += ` HAVING ${having}`;
        }
      }
      
      if (orderBy) {
        sql += ` ORDER BY ${orderBy}`;
      }
      
      if (limit) {
        sql += ` LIMIT ${offset}, ${limit}`;
      }
      
      const [rows] = await connection.execute(sql, values);
      
      // 如果需要获取总数（分页时有用）
      let total = 0;
      if (limit && offset === 0) {
        const countResult = await this.count(table, conditions);
        if (countResult.success) {
          total = countResult.count;
        }
      }
      
      return {
        success: true,
        data: rows,
        total: total || rows.length,
        limit: limit,
        offset: offset
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code,
        data: []
      };
    } finally {
      connection.release();
    }
  }

  /**
   * 计数查询
   */
  async count(table, conditions = {}) {
    const connection = await this.pool.getConnection();
    
    try {
      const { whereClause, values } = this._buildWhereClause(conditions);
      
      let sql = `SELECT COUNT(*) as count FROM \`${table}\``;
      if (whereClause) {
        sql += ` WHERE ${whereClause}`;
      }
      
      const [rows] = await connection.execute(sql, values);
      
      return {
        success: true,
        count: rows[0].count
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code,
        count: 0
      };
    } finally {
      connection.release();
    }
  }

  /**
   * 执行原生 SQL 查询
   */
  async query(sql, params = [], options = {}) {
    const {
      timeout = 30000,
      nestTables = false,
      rowsAsArray = false
    } = options;
    
    const connection = await this.pool.getConnection();
    
    try {
      const [results, fields] = await connection.execute({
        sql,
        timeout,
        nestTables,
        rowsAsArray
      }, params);
      
      return {
        success: true,
        data: results,
        fields: fields,
        affectedRows: results.affectedRows,
        insertId: results.insertId,
        changedRows: results.changedRows
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code,
        data: null
      };
    } finally {
      connection.release();
    }
  }

  /**
   * 更新数据
   */
  async update(table, data, conditions = {}, options = {}) {
    const connection = await this.pool.getConnection();
    
    try {
      // 过滤更新数据
      const filteredData = this._filterData(data, options.filter);
      
      if (Object.keys(filteredData).length === 0) {
        throw new Error('没有有效数据可更新');
      }
      
      // 构建 SET 子句
      const setClause = Object.keys(filteredData)
        .map(key => `\`${key}\` = ?`)
        .join(', ');
      
      const setValues = Object.values(filteredData);
      
      // 构建 WHERE 子句
      const { whereClause, values: whereValues } = this._buildWhereClause(conditions);
      
      if (!whereClause && options.allowEmptyWhere !== true) {
        throw new Error('更新操作必须指定条件，或显式允许空条件');
      }
      
      const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClause || '1=1'}`;
      const allValues = [...setValues, ...whereValues];
      
      const [result] = await connection.execute(sql, allValues);
      
      return {
        success: true,
        affectedRows: result.affectedRows,
        changedRows: result.changedRows,
        message: result.message
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    } finally {
      connection.release();
    }
  }

  /**
   * 删除数据
   */
  async delete(table, conditions = {}, options = {}) {
    const connection = await this.pool.getConnection();
    
    try {
      const { whereClause, values } = this._buildWhereClause(conditions);
      
      if (!whereClause && options.allowEmptyWhere !== true) {
        throw new Error('删除操作必须指定条件，或显式允许空条件');
      }
      
      const sql = `DELETE FROM \`${table}\` WHERE ${whereClause || '1=1'}`;
      
      const [result] = await connection.execute(sql, values);
      
      return {
        success: true,
        affectedRows: result.affectedRows,
        message: result.message
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    } finally {
      connection.release();
    }
  }

  /**
   * 带事务的查询
   */
  async transaction(callback) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 创建一个事务上下文
      const txContext = {
        connection,
        insert: async (table, data, options = {}) => {
          const filteredData = this._filterData(data, options.filter);
          const columns = Object.keys(filteredData);
          const values = Object.values(filteredData);
          const sql = this._buildInsertSQL(table, columns, options);
          const [result] = await connection.execute(sql, values);
          return result;
        },
        find: async (table, conditions = {}, options = {}) => {
          const { whereClause, values } = this._buildWhereClause(conditions);
          let sql = `SELECT * FROM \`${table}\``;
          if (whereClause) sql += ` WHERE ${whereClause}`;
          const [rows] = await connection.execute(sql, values);
          return rows;
        },
        update: async (table, data, conditions = {}) => {
          const filteredData = this._filterData(data, {});
          const setClause = Object.keys(filteredData)
            .map(key => `\`${key}\` = ?`)
            .join(', ');
          const setValues = Object.values(filteredData);
          const { whereClause, values: whereValues } = this._buildWhereClause(conditions);
          const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClause}`;
          const [result] = await connection.execute(sql, [...setValues, ...whereValues]);
          return result;
        },
        delete: async (table, conditions = {}) => {
          const { whereClause, values } = this._buildWhereClause(conditions);
          const sql = `DELETE FROM \`${table}\` WHERE ${whereClause}`;
          const [result] = await connection.execute(sql, values);
          return result;
        },
        query: async (sql, params = []) => {
          const [result] = await connection.execute(sql, params);
          return result;
        }
      };
      
      // 执行用户回调
      const result = await callback(txContext);
      
      await connection.commit();
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * 获取连接状态信息
   */
  async getConnectionStats() {
    try {
      const [result] = await this.query('SHOW STATUS LIKE "Threads_connected"');
      const [variables] = await this.query('SHOW VARIABLES LIKE "max_connections"');
      
      return {
        success: true,
        currentConnections: result.data[0]?.Value || 0,
        maxConnections: variables.data[0]?.Value || 0,
        poolSize: this.pool.pool?.config?.connectionLimit || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============ 私有方法 ============

  /**
   * 构建 WHERE 子句
   */
  _buildWhereClause(conditions) {
    if (!conditions || Object.keys(conditions).length === 0) {
      return { whereClause: '', values: [] };
    }
    
    const clauses = [];
    const values = [];
    
    for (const [key, value] of Object.entries(conditions)) {
      if (value === undefined || value === null) {
        clauses.push(`\`${key}\` IS NULL`);
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          clauses.push(`\`${key}\` IN (${value.map(() => '?').join(', ')})`);
          values.push(...value);
        }
      } else if (typeof value === 'object' && value.operator) {
        // 支持操作符：{ field: { operator: '>', value: 10 } }
        const operator = value.operator.toUpperCase();
        clauses.push(`\`${key}\` ${operator} ?`);
        values.push(value.value);
      } else {
        clauses.push(`\`${key}\` = ?`);
        values.push(value);
      }
    }
    
    return {
      whereClause: clauses.join(' AND '),
      values
    };
  }

  /**
   * 过滤数据（保持原样）
   */
  _filterData(data, filterOptions = {}) {
    const {
      ignoreUndefined = true,
      ignoreNull = false,
      ignoreEmptyString = false,
      excludeFields = [],
      includeOnly = null
    } = filterOptions || {};
    
    return Object.entries(data).reduce((acc, [key, value]) => {
      // 排除字段
      if (excludeFields.includes(key)) {
        return acc;
      }
      
      // 只包含指定字段
      if (includeOnly && !includeOnly.includes(key)) {
        return acc;
      }
      
      // 处理 undefined
      if (ignoreUndefined && value === undefined) {
        return acc;
      }
      
      // 处理 null
      if (ignoreNull && value === null) {
        return acc;
      }
      
      // 处理空字符串
      if (ignoreEmptyString && value === '') {
        return acc;
      }
      
      // 类型转换
      if (value instanceof Date) {
        acc[key] = value.toISOString().slice(0, 19).replace('T', ' ');
      } else if (value === null || value === undefined) {
        acc[key] = null;
      } else {
        acc[key] = value;
      }
      
      return acc;
    }, {});
  }

  /**
   * 构建插入 SQL（保持原样）
   */
  _buildInsertSQL(table, columns, options) {
    const {
      onDuplicateUpdate = false,
      ignore = false,
      replace = false
    } = options;
    
    let sql;
    if (replace) {
      sql = 'REPLACE';
    } else if (ignore) {
      sql = 'INSERT IGNORE';
    } else {
      sql = 'INSERT';
    }
    
    const columnList = columns.map(col => `\`${col}\``).join(', ');
    const placeholders = columns.map(() => '?').join(', ');
    
    sql += ` INTO \`${table}\` (${columnList}) VALUES (${placeholders})`;
    
    if (onDuplicateUpdate) {
      const updateClause = columns
        .map(col => `\`${col}\` = VALUES(\`${col}\`)`)
        .join(', ');
      sql += ` ON DUPLICATE KEY UPDATE ${updateClause}`;
    }
    
    return sql;
  }
}

// 导出类
export default MysqlUtils;

// 初始化连接池
// const pool = mysql.createPool({
//   host: '192.168.0.124',
//   user: 'root',
//   password: 'root',
//   database: 'ningxiang',
//   waitForConnections: true,
//   connectionLimit: 10,
//   connectionTimeout: 10000,
//   queueLimit: 0,
//   enableKeepAlive: true,
//   keepAliveInitialDelay: 0,
// });

// 创建插入器实例
// export const mysqlUtils = new MysqlUtils(pool);

// 使用示例
// 1. 查询数据
// mysqlUtils.findOne("registered_njczrk", {SFZH: idCard})

// 2. 插入数据
// mysqlUtils.insert('registered_njczrk', data, {
//   filter: {
//     ignoreNull: true,
//     ignoreEmptyString: true
//   }
// })