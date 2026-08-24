const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;
const JWT_SECRET = 'mttq-campha-super-secret-key-2026'; // In production, use environment variables

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected.');
    db.serialize(() => {
      // 1. Create tables
      db.run(`CREATE TABLE IF NOT EXISTS petitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT,
        phone TEXT,
        cccd TEXT,
        ward TEXT,
        address TEXT,
        title TEXT,
        category TEXT,
        content TEXT,
        imagePaths TEXT,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )`);

      // 1b. Create Wards table
      db.run(`CREATE TABLE IF NOT EXISTS wards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Seed wards if empty
      db.get('SELECT COUNT(*) as count FROM wards', (err, row) => {
        if (!err && row.count === 0) {
          const stmt = db.prepare('INSERT INTO wards (name) VALUES (?)');
          // Add 20 default wards
          for (let i = 1; i <= 20; i++) {
            stmt.run(`Khu phố ${i}`);
          }
          stmt.finalize();
        }
      });


      // 2. Performance Optimization: Add Index on createdAt for faster sorting
      db.run(`CREATE INDEX IF NOT EXISTS idx_petitions_createdAt ON petitions (createdAt DESC)`);

      // 3. Security: Hash default admin password or update if it's plaintext
      db.get(`SELECT password FROM admins WHERE username = 'admin'`, async (err, row) => {
        if (!row) {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash('123456', saltRounds);
          db.run(`INSERT INTO admins (username, password) VALUES (?, ?)`, ['admin', hashedPassword]);
        } else if (!row.password.startsWith('$2b$')) {
          // If the password exists but is not a bcrypt hash, update it
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash('123456', saltRounds);
          db.run(`UPDATE admins SET password = ? WHERE username = 'admin'`, [hashedPassword]);
        }
      });
    });
  }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ error: 'Truy cập bị từ chối. Vui lòng đăng nhập.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
    req.user = user;
    next();
  });
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: storage });

// API Endpoints

// 1. Submit a petition (Public)
app.post('/api/petitions', (req, res) => {
  const uploadMiddleware = upload.array('images', 20); // Tăng giới hạn lên 20 ảnh

  uploadMiddleware(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading (e.g., too many files)
      return res.status(400).json({ error: 'Lỗi tải ảnh: Số lượng hoặc dung lượng ảnh vượt quá giới hạn cho phép.' });
    } else if (err) {
      // An unknown error occurred when uploading
      console.error('Multer error:', err);
      return res.status(500).json({ error: 'Đã xảy ra lỗi không xác định khi tải ảnh.' });
    }

    let { fullName, phone, cccd, ward, address, title, category, content } = req.body;

  // Basic input sanitization (trim spaces)
  fullName = fullName ? fullName.trim() : '';
  title = title ? title.trim() : '';

  const files = req.files;
  const imagePaths = files ? files.map(file => file.filename).join(',') : '';

  const sql = `INSERT INTO petitions (fullName, phone, cccd, ward, address, title, category, content, imagePaths)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [fullName, phone, cccd, ward, address, title, category, content, imagePaths];

  db.run(sql, params, function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save petition.' });
    } else {
      res.status(201).json({ message: 'Petition saved successfully.', id: this.lastID });
    }
  });
  }); // Đóng callback của uploadMiddleware
});

// 2. Get all petitions (Public) - Hides sensitive data
app.get('/api/petitions', (req, res) => {
  db.all('SELECT id, fullName, title, category, content, imagePaths, status, createdAt FROM petitions ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve petitions.' });
    } else {
      res.status(200).json(rows);
    }
  });
});

// 3. Get all petitions (Protected - Admin only) - Shows all data
app.get('/api/admin/petitions', authenticateToken, (req, res) => {
  db.all('SELECT id, fullName, phone, cccd, ward, address, title, category, content, imagePaths, status, createdAt FROM petitions ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve petitions.' });
    } else {
      res.status(200).json(rows);
    }
  });
});

// 3b. Update petition status (Admin only)
app.put('/api/admin/petitions/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run('UPDATE petitions SET status = ? WHERE id = ?', [status, id], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update status.' });
    } else {
      res.status(200).json({ message: 'Status updated successfully.' });
    }
  });
});

// 3c. Delete petition (Admin only)
app.delete('/api/admin/petitions/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM petitions WHERE id = ?', [id], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete petition.' });
    } else {
      res.status(200).json({ message: 'Petition deleted successfully.' });
    }
  });
});

// --- WARDS API ---
// Get all wards (Public)
app.get('/api/wards', (req, res) => {
  db.all('SELECT id, name, createdAt FROM wards', [], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve wards.' });
    } else {
      // Custom sort to handle "Khu phố 1" vs "Khu phố 10" properly
      rows.sort((a, b) => {
        const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
        return numA - numB || a.name.localeCompare(b.name);
      });
      res.status(200).json(rows);
    }
  });
});

// Add a new ward (Admin only)
app.post('/api/admin/wards', authenticateToken, (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Tên khu phố không được để trống' });
  }

  db.run('INSERT INTO wards (name) VALUES (?)', [name.trim()], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Khu phố đã tồn tại hoặc có lỗi xảy ra.' });
    } else {
      res.status(201).json({ id: this.lastID, name: name.trim() });
    }
  });
});

// Update a ward (Admin only)
app.put('/api/admin/wards/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Tên khu phố không được để trống' });
  }

  db.run('UPDATE wards SET name = ? WHERE id = ?', [name.trim(), id], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Có lỗi xảy ra khi cập nhật.' });
    } else {
      res.status(200).json({ message: 'Cập nhật thành công.' });
    }
  });
});

// Delete a ward (Admin only)
app.delete('/api/admin/wards/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM wards WHERE id = ?', [id], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Có lỗi xảy ra khi xóa.' });
    } else {
      res.status(200).json({ message: 'Xóa khu phố thành công.' });
    }
  });
});

// Get all accounts (Admin only)
app.get('/api/admin/accounts', authenticateToken, (req, res) => {
  db.all('SELECT id, username FROM admins', [], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve accounts.' });
    } else {
      const accounts = rows.map(r => ({
        id: r.id,
        name: r.username,
        email: `${r.username}@campha.gov.vn`, // Simulated email
        role: 'admin',
        status: 'active',
        lastLogin: '---'
      }));
      res.status(200).json(accounts);
    }
  });
});

// Add a new account (Admin only)
app.post('/api/admin/accounts', authenticateToken, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Tên đăng nhập và mật khẩu không được để trống' });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    db.run('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Tên đăng nhập đã tồn tại hoặc có lỗi xảy ra.' });
      } else {
        res.status(201).json({ id: this.lastID, username });
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Update an account (Admin only)
app.put('/api/admin/accounts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Tên đăng nhập không được để trống' });
  }

  try {
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      db.run('UPDATE admins SET username = ?, password = ? WHERE id = ?', [username, hashedPassword, id], function (err) {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Có lỗi xảy ra khi cập nhật.' });
        } else {
          res.status(200).json({ message: 'Cập nhật thành công.' });
        }
      });
    } else {
      db.run('UPDATE admins SET username = ? WHERE id = ?', [username, id], function (err) {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Có lỗi xảy ra khi cập nhật.' });
        } else {
          res.status(200).json({ message: 'Cập nhật thành công.' });
        }
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Delete an account (Admin only)
app.delete('/api/admin/accounts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM admins WHERE id = ?', [id], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Có lỗi xảy ra khi xóa.' });
    } else {
      res.status(200).json({ message: 'Xóa tài khoản thành công.' });
    }
  });
});

// 4. Login (Issues JWT)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT id, username, password FROM admins WHERE username = ?', [username], async (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    } else if (row) {
      // Compare submitted password with stored bcrypt hash
      const match = await bcrypt.compare(password, row.password);
      if (match) {
        // Generate JWT Token
        const token = jwt.sign({ id: row.id, username: row.username }, JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({ message: 'Login successful', token });
      } else {
        res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
      }
    } else {
      res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }
  });
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
