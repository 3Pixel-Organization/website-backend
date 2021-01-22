const passport = require('passport');
const log = require('console');

require('./discord.strategy');
const { FRONTEND_URL } = require('../../config');

module.exports = {
  name: 'oauth',
  routes: {
    'GET /auth/discord': 'doDiscordAuth',
    'GET /auth/discord/redirect': 'discordRedirect',
  },
  actions: {
    doDiscordAuth: {
      middleware: [passport.authenticate('discord', { session: false })],
      handler({ req, res }) {
        res.send({ message: 'Not implemented.' });
      },
    },
    discordRedirect: {
      middleware: [
        passport.authenticate('discord', {
          failureRedirect:
            `${FRONTEND_URL}/login?error=Discord login failed`,
          session: false,
        }),
      ],
      handler({ req, res }) {
        log.info('user:', req.user);
        res.redirect(
          `${FRONTEND_URL}/login?refresh=${req.user.tokens.refresh}&access=${req.user.tokens.access}`,
        );
      },
    },
  },
};
