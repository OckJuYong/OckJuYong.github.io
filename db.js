const mysql = require('mysql2');
const config = require('./config.json');

const pool = mysql.createPool({
  host: config.development.host,
  user: config.development.username,
  password: config.development.password,
  database: config.development.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    // SSL 인증 무시
    rejectUnauthorized: false
  }
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('데이터베이스 연결 실패: ' + err.stack);
    return;
  }

  console.log('데이터베이스 연결 성공. 연결 ID: ' + connection.threadId);
  connection.release(); // 연결 해제
});

module.exports = pool.promise();
