const log = require('consola');
const DiscordStrategy = require('passport-discord').Strategy;
const passport = require('passport');

const User = require('../../models/user.model');
const { createSession } = require('./jwt');

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CLIENT_REDIRECT,
      scope: ['identify', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      let user;
      try {
        user = await User.findOne({ 'oauth.discord': profile.id });
        if (!user) {
          user = new User({
            email: profile.email,
            username: profile.username,
            password: null,
            oauth: { discord: profile.id },
          });
          await user.save();
        }
      } catch (err) {
        log.error(err);
        done(err);
        return;
      }

      log.info(profile);
      const userSession = await createSession(user);
      done(null, {
        tokens: {
          refresh: userSession.refreshToken,
          access: userSession.accessToken,
        },
      });
    },
  ),
);
