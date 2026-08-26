const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const DB_FILE = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(DB_FILE);

const initDB = () => {
  db.run('PRAGMA journal_mode = WAL;');
  db.serialize(() => {
    // 1. Create Admins table
    db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )
    `);

    // 2. Create Petitions table
    db.run(`
      CREATE TABLE IF NOT EXISTS petitions (
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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        trackingCode TEXT UNIQUE,
        adminNotes TEXT
      )
    `);

    // Handle migrations for older tables
    db.run(`ALTER TABLE petitions ADD COLUMN cccd TEXT`, () => { });
    db.run(`ALTER TABLE petitions ADD COLUMN trackingCode TEXT`, () => { });
    db.run(`ALTER TABLE petitions ADD COLUMN adminNotes TEXT`, () => { });

    // 3. Create Tracking Logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS tracking_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        petitionId INTEGER,
        action TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(petitionId) REFERENCES petitions(id)
      )
    `);

    // 4. Create Wards table
    db.run(`
      CREATE TABLE IF NOT EXISTS wards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
      )
    `, (err) => {
      if (!err) {
        db.get('SELECT COUNT(*) as count FROM wards', (err, row) => {
          if (row.count === 0) {
            const stmt = db.prepare('INSERT INTO wards (name) VALUES (?)');
            for (let i = 1; i <= 20; i++) {
              stmt.run(`Khu phố ${i}`);
            }
            stmt.finalize();
          }
        });
      }
    });

    // 5. Performance Optimization: Add Indexes
    db.run(`CREATE INDEX IF NOT EXISTS idx_petitions_createdAt ON petitions (createdAt DESC)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_petitions_status ON petitions (status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_petitions_ward ON petitions (ward)`);

    // 6. Security: Hash default admin password
    db.get(`SELECT password FROM admins WHERE username = 'admin'`, async (err, row) => {
      if (!row) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('123456', saltRounds);
        db.run(`INSERT INTO admins (username, password) VALUES (?, ?)`, ['admin', hashedPassword]);
      } else if (!row.password.startsWith('$2b$')) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('123456', saltRounds);
        db.run(`UPDATE admins SET password = ? WHERE username = 'admin'`, [hashedPassword]);
      }
    });
  });
};

initDB();

module.exports = db;
