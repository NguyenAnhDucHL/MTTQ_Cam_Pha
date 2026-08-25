const net = require('net');
const fs = require('fs');
const path = require('path');
const fsp = require('fs').promises;

/**
 * Sends a file via TCP stream to ClamAV and returns the scan result.
 */
function scanFile(filePath) {
  return new Promise((resolve, reject) => {
    const host = process.env.CLAMAV_HOST || 'clamav';
    const port = parseInt(process.env.CLAMAV_PORT || '3310', 10);

    const client = net.createConnection({ host, port }, () => {
      // Protocol: Send zINSTREAM command
      client.write('zINSTREAM\0');

      const fileStream = fs.createReadStream(filePath, { highWaterMark: 4096 });

      fileStream.on('data', (chunk) => {
        // Each chunk: 4 bytes big-endian length + data
        const lengthBuffer = Buffer.alloc(4);
        lengthBuffer.writeUInt32BE(chunk.length, 0);
        client.write(lengthBuffer);
        client.write(chunk);
      });

      fileStream.on('end', () => {
        // End stream: chunk length 0
        const zeroBuffer = Buffer.alloc(4);
        zeroBuffer.writeUInt32BE(0, 0);
        client.write(zeroBuffer);
      });

      fileStream.on('error', (err) => {
        client.destroy();
        reject(err);
      });
    });

    let response = '';
    client.on('data', (data) => {
      response += data.toString();
    });

    client.on('end', () => {
      resolve(response.trim().replace(/\0/g, ''));
    });

    client.on('error', (err) => {
      reject(err);
    });

    // 10 second timeout for ClamAV connection
    client.setTimeout(10000);
    client.on('timeout', () => {
      client.destroy();
      reject(new Error('ClamAV timeout'));
    });
  });
}

/**
 * Middleware to scan uploaded files for viruses.
 * Applies Fail-Closed policy: blocks upload if scan fails.
 */
const virusScanMiddleware = async (req, res, next) => {
  const files = [];
  if (req.files && Array.isArray(req.files)) {
    files.push(...req.files);
  } else if (req.file) {
    files.push(req.file);
  }

  if (files.length === 0) {
    return next();
  }

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  try {
    for (const file of files) {
      try {
        const result = await scanFile(file.path);

        if (result.endsWith('OK')) {
          // File is clean, move to uploads
          const finalPath = path.join(uploadsDir, file.filename);
          await fsp.rename(file.path, finalPath);
          file.path = finalPath;
          file.destination = uploadsDir;
        } else if (result.includes('FOUND')) {
          const parts = result.split(':');
          const virusName = parts.length > 1 ? parts[1].replace('FOUND', '').trim() : 'Unknown Virus';
          throw new Error(`PHÁT HIỆN VIRUS: ${virusName}`);
        } else {
          throw new Error(`Phản hồi ClamAV không hợp lệ: ${result}`);
        }
      } catch (scanError) {
        // Fail-Closed: If ClamAV fails or detects virus, throw error to catch block
        console.error(`[VirusScan] Lỗi quét file ${file.filename}:`, scanError.message);
        throw scanError;
      }
    }

    // All clean
    next();
  } catch (error) {
    // Delete all quarantined files from this request
    for (const file of files) {
      try {
        if (fs.existsSync(file.path)) {
          await fsp.unlink(file.path);
        }
      } catch (err) {
        console.error(`[VirusScan] Không thể xóa file cách ly ${file.path}:`, err.message);
      }
    }

    if (error.message.includes('PHÁT HIỆN VIRUS')) {
      return res.status(400).json({ error: `File bị từ chối do có chứa mã độc. (${error.message})` });
    } else {
      return res.status(503).json({ error: 'Hệ thống quét virus đang bảo trì hoặc quá tải. Vui lòng thử lại sau.' });
    }
  }
};

module.exports = { virusScanMiddleware };
