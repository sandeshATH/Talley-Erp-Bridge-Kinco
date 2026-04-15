module.exports = (req, res, next) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return next(); // skip auth if API_KEY is not configured
  const provided = req.headers['x-api-key'];
  if (provided !== apiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
