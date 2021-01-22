const jwt = require('jsonwebtoken');

const { JWT_TOKEN_SECRET, JWT_REFRESH_SECRET } = require('../../config');
const Session = require('../../models/session.model');

async function createSession(user) {
  // JWT
  const refreshToken = jwt.sign({ sub: user._id }, JWT_REFRESH_SECRET, {
    expiresIn: 604800,
  }); // 1 week
  const accessToken = await generateAccessToken(user._id);

  let session;
  try {
    session = await Session.findOne({ userId: user._id }).exec();
    if (session) {
      session.refreshToken = refreshToken;
      await session.save();
    } else {
      await Session.create({ userId: user._id, refreshToken });
    }
  } catch (err) {
    return null;
  }

  return { refreshToken, accessToken, session };
}

function generateAccessToken(userId) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { sub: userId },
      JWT_TOKEN_SECRET,
      { expiresIn: 1200 },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      },
    );
  });
}

module.exports = {
  createSession,
};
