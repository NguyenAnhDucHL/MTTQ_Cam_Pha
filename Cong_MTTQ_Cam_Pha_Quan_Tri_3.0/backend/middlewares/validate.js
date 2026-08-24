const recentPetitions = new Map();

const checkDuplicatePetition = (req, res, next) => {
  const { phone, title } = req.body;
  if (!phone || !title) return next();

  const key = `${phone}-${title}`;
  const now = Date.now();

  if (recentPetitions.has(key)) {
    const lastSent = recentPetitions.get(key);
    if (now - lastSent < 10 * 60 * 1000) { // 10 minutes
      return res.status(429).json({ error: 'Bạn đã gửi một phản ánh giống hệt trong 10 phút qua. Xin vui lòng không gửi lại.' });
    }
  }

  recentPetitions.set(key, now);

  // Optional: clear memory map entries older than 10 mins to prevent memory leak
  for (let [k, v] of recentPetitions.entries()) {
    if (now - v > 10 * 60 * 1000) {
      recentPetitions.delete(k);
    }
  }

  next();
};

module.exports = { checkDuplicatePetition };
