const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const { prisma } = require("../lib/prisma.js");
const bcrypt = require("bcryptjs");

const verifyCallback = async (username, password, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return done(null, false, { message: "Incorrect Username or Password" });
    }

    console.log(user);

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return done(null, false, { message: "Incorrect Username or Password" });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    done(null, user);
  } catch (err) {
    done(err);
  }
});

const strategy = new localStrategy(verifyCallback);

passport.use(strategy);
