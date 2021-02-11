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
      console.log('profile', profile);
      const avatarURL = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=512`;

      let user;
      try {
        user = await User.findOne({ 'oauth.discord': profile.id });
        if (!user) {
          user = new User({
            email: profile.email,
            username: profile.username,
            password: null,
            avatar: avatarURL,
            oauth: { discord: profile.id },
          });
          await user.save();
        }

        if (user.avatar !== avatarURL) {
          user.avatar = avatarURL;
          await user.save();
        }
      } catch (err) {
        log.error(err);
        done(err);
        return;
      }

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
