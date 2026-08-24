const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.sqlite');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

// Generate backup filename based on current date
const date = new Date();
const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
const backupFile = path.join(BACKUP_DIR, `database_backup_${dateString}.sqlite`);

console.log(`Bắt đầu sao lưu cơ sở dữ liệu...`);

try {
  if (fs.existsSync(DB_FILE)) {
    // Copy the database file
    fs.copyFileSync(DB_FILE, backupFile);
    console.log(`✅ Sao lưu thành công: ${backupFile}`);

    // Optional: Clean up old backups (keep only last 7 days)
    const files = fs.readdirSync(BACKUP_DIR);
    if (files.length > 7) {
      // Sort files by creation time (oldest first)
      const sortedFiles = files
        .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
        .sort((a, b) => a.time - b.time);

      // Delete oldest files to keep only 7
      const filesToDelete = sortedFiles.slice(0, sortedFiles.length - 7);
      for (const file of filesToDelete) {
        fs.unlinkSync(path.join(BACKUP_DIR, file.name));
        console.log(`🗑️ Đã xóa bản sao lưu cũ: ${file.name}`);
      }
    }
  } else {
    console.error('❌ Không tìm thấy file cơ sở dữ liệu để sao lưu.');
  }
} catch (error) {
  console.error('❌ Lỗi khi sao lưu cơ sở dữ liệu:', error);
}
