const passport = require("passport");
const { prisma } = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const { body, validationResult, matchedData } = require("express-validator");

const validateSignup = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username should be between 3 and 20 characters")
    .toLowerCase()
    .custom(async (value) => {
      const user = await prisma.user.findFirst({
        where: { username: value },
      });
      if (user) throw new Error("Username already exists");
    }),
  body("password").trim(),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value != req.body.password) throw new Error("Passwords do not match");
      return true;
    }),
];

module.exports.getLogin = (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/");
  res.render("login");
};

module.exports.getSignup = (req, res) => {
  res.render("signup");
};

module.exports.postLogin = (req, res, next) => {
  // manual method to verify the user, and for easy error handling.
  const verify = passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.render("login", { error: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  });
  // this line is added because, passport.authenticate(...) returns a function... and the below line calls that function.
  verify(req, res, next);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

module.exports.postSignup = [
  validateSignup,
  (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .render("signup", { errors: errors.array(), body: req.body });
    }
    next();
  },
  async (req, res, next) => {
    const { username, password } = matchedData(req);
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          folders: {
            create: {
              name: "root",
            },
          },
        },
      });
    } catch (err) {
      return next(err);
    }
    res.redirect("/login");
  },
];
