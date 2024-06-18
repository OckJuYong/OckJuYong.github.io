const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db'); // db.js 파일을 임포트

const port = 3000;

const app = express();

// CORS 설정 미들웨어
app.use(cors());

// JSON 파싱 미들웨어
app.use(bodyParser.json());

// 모든 요청을 로깅하는 미들웨어
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// GET: 기본 경로에 대한 응답
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// GET: 모든 사용자 조회
app.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: 특정 사용자 조회
app.get('/users/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE userId = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: 새 사용자 추가
app.post('/users', async (req, res) => {
  const { userId, name, price, language, address, schedule, place, tag, goal, time, day } = req.body;

  try {
    const [result] = await db.query('INSERT INTO users (userId, name, price, language, address, schedule, place, tag, goal, time, day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [userId, name, price, language, address, schedule, place, tag, goal, time, day]);
    res.status(201).json({ userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: 사용자 정보 수정
app.put('/users/:id', async (req, res) => {
  const { name, price, language, address, schedule, place, tag, goal, time, day } = req.body;
  try {
    const [result] = await db.query('UPDATE users SET name = ?, price = ?, language = ?, address = ?, schedule = ?, place = ?, tag = ?, goal = ?, time = ?, day = ? WHERE userId = ?', 
    [name, price, language, address, schedule, place, tag, goal, time, day, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: 사용자 삭제
app.delete('/users/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE userId = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});

// MySQL 연결 설정
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
