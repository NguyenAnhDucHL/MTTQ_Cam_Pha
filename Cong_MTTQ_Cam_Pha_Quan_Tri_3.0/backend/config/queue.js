const { Queue, Worker } = require('bullmq');
const db = require('./database');
const IORedis = require('ioredis');

// Connect to Redis. In docker it's 'redis', locally it's 'localhost'
const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null
});

// Create the Petition Queue
const petitionQueue = new Queue('petitionQueue', { connection });

// Define the Worker that processes jobs from the queue
const worker = new Worker('petitionQueue', async (job) => {
  console.log(`[Worker] Processing petition job: ${job.id}`);
  const { fullName, phone, cccd, ward, address, title, category, content, imagePaths, trackingCode } = job.data;

  const sql = `INSERT INTO petitions (fullName, phone, cccd, ward, address, title, category, content, imagePaths, trackingCode)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [fullName, phone, cccd, ward, address, title, category, content, imagePaths, trackingCode];

  // Wrap db.run in a Promise
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        console.error(`[Worker] Failed to save petition ${job.id}:`, err);
        return reject(err);
      }
      console.log(`[Worker] Petition saved successfully. Row ID: ${this.lastID}`);
      resolve(this.lastID);
    });
  });
}, { connection });

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} has failed with ${err.message}`);
});

module.exports = {
  petitionQueue
};
