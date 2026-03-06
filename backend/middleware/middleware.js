const jwt = require('jsonwebtoken');
const User = require('../models/user');
const secret = process.env.ACCESS_JWT

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log(token)
  if (!token) return res.status(401).send({ message: 'No token provided' });

  jwt.verify(token, secret, async (err, decoded) => {
    if (err) return res.status(401).send({ message: 'Failed to authenticate token' });
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).send({ message: 'User not found' });

    req.user = user;
    next();
  });
};

const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).send({ message: 'Forbidden' });
  }
  next();
};

module.exports = { authenticate, authorize };
