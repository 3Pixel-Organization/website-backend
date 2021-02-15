const log = require('consola');
const jwt = require('jsonwebtoken');

const { JWT_TOKEN_SECRET, ERRORS } = require('../config');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const Session = require('../models/session.model');

module.exports = ({ required, permissions = [] }) => async (req, res, next) => {
  const token = req.headers['authorization']?.slice(7);
  if (!token) {
    return res.status(401).send(ERRORS.AUTH.NO_TOKEN);
  }
  try {
    const payload = jwt.verify(token, JWT_TOKEN_SECRET);

    if ((await Session.countDocuments({ userId: payload.sub }).exec()) < 1) {
      return res.status(403).send(ERRORS.AUTH.INVALID_TOKEN);
    }

    const user = await User.findById(payload.sub).populate({
      path: 'roles',
      populate: 'permissions',
    });
    req.user = user;
  } catch (err) {
    if (!err.message.startsWith('jwt')) {
      log.error(err);
    }
  }
  if (required && !req.user) {
    return res.status(403).send(ERRORS.AUTH.INVALID_TOKEN);
  }
  for (const permission of permissions) {
    if (!req.user.checkForPermission(permission)) {
      return res.status(403).send(ERRORS.AUTH.UNAUTHORIZED);
    }
  }
  next();
};
