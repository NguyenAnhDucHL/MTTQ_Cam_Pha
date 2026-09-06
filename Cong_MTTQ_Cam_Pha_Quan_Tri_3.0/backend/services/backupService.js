const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { ZipArchive } = require('archiver');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Đảm bảo thư mục backups tồn tại
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Hàm thực thi việc nén file
const performBackup = async () => {
  return new Promise((resolve, reject) => {
    try {
      const date = new Date();
      // Định dạng tên file: backup-YYYY-MM-DD-HH-mm-ss.zip
      const dateString = date.toISOString().replace(/T/, '-').replace(/:/g, '-').split('.')[0];
      const backupFileName = `backup-${dateString}.zip`;
      const backupFilePath = path.join(BACKUP_DIR, backupFileName);

      const output = fs.createWriteStream(backupFilePath);
      const archive = new ZipArchive({
        zlib: { level: 9 } // Mức độ nén cao nhất
      });

      output.on('close', () => {
        console.log(`[Backup] Đã tạo bản sao lưu thành công: ${backupFileName} (${archive.pointer()} bytes)`);
        cleanupOldBackups();
        resolve(backupFilePath);
      });

      archive.on('error', (err) => {
        console.error('[Backup] Lỗi trong quá trình nén:', err);
        reject(err);
      });

      archive.pipe(output);

      // Thêm file cơ sở dữ liệu vào file nén
      const dbFile = path.join(DATA_DIR, 'database.sqlite');
      if (fs.existsSync(dbFile)) {
        archive.file(dbFile, { name: 'database.sqlite' });
      }

      // Thêm toàn bộ thư mục uploads vào file nén
      if (fs.existsSync(UPLOADS_DIR)) {
        archive.directory(UPLOADS_DIR, 'uploads');
      }

      archive.finalize();
    } catch (err) {
      console.error('[Backup] Lỗi hệ thống khi backup:', err);
      reject(err);
    }
  });
};

// Hàm tự động xóa các file backup cũ hơn 7 ngày
const cleanupOldBackups = () => {
  const MAX_AGE_DAYS = 7;
  const now = Date.now();

  fs.readdir(BACKUP_DIR, (err, files) => {
    if (err) {
      console.error('[Backup] Lỗi khi đọc thư mục backup để dọn dẹp:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(BACKUP_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;

        const ageInMs = now - stats.mtimeMs;
        const ageInDays = ageInMs / (1000 * 60 * 60 * 24);

        if (ageInDays > MAX_AGE_DAYS && file.endsWith('.zip')) {
          fs.unlink(filePath, (err) => {
            if (!err) {
              console.log(`[Backup] Đã tự động xóa file backup cũ: ${file}`);
            }
          });
        }
      });
    });
  });
};

// Lên lịch chạy vào 02:00 sáng mỗi ngày
// Format: phút giờ ngày tháng thứ
cron.schedule('0 2 * * *', () => {
  console.log('[Backup] Bắt đầu tiến trình sao lưu tự động (02:00 AM)...');
  performBackup();
});

console.log('[Backup] Dịch vụ sao lưu tự động đã được khởi động (Chạy lúc 2h sáng).');

module.exports = {
  performBackup,
  BACKUP_DIR
};
