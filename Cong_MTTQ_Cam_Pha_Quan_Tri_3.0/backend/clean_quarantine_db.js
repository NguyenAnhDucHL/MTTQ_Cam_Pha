const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, 'uploads');
const quarantineDir = path.join(uploadsDir, '.quarantine');

const db = require('./config/database');

db.serialize(() => {
  db.all(`SELECT id, fileUrl FROM documents WHERE fileUrl LIKE '%/.quarantine/%'`, [], (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`Found ${rows.length} documents with .quarantine paths.`);

    rows.forEach(row => {
      let urls = [];
      try {
        urls = JSON.parse(row.fileUrl);
      } catch (e) {
        urls = [row.fileUrl];
      }

      const newUrls = urls.map(url => {
        if (url.includes('/.quarantine/')) {
          const filename = path.basename(url);
          const oldPath = path.join(quarantineDir, filename);
          const newPath = path.join(uploadsDir, filename);

          if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            console.log(`Moved ${filename} out of quarantine.`);
          } else {
            console.log(`File ${filename} not found in quarantine, skipping move.`);
          }

          return url.replace('/.quarantine/', '/');
        }
        return url;
      });

      const newUrlStr = JSON.stringify(newUrls);
      db.run(`UPDATE documents SET fileUrl = ? WHERE id = ?`, [newUrlStr, row.id], function (updateErr) {
        if (updateErr) {
          console.error(`Error updating document ${row.id}:`, updateErr.message);
        } else {
        }
      });
    });
  });
});
