const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const User = require("../models/User");

exports.loginAndSignup = (req, res, next) => {
  res.render("auth/loginAndSignup", {
    title: "FB login or signup",
    errorMessage: "",
    appUrl: process.env.APP_URL,
    oldInput: { email: "", password: "", firstname: "", surname: "" },
  });
};

exports.postSignup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const firstname = req.body.firstname;
  const surname = req.body.surname;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.status(422).render("auth/loginAndSignup", {
      title: "FB login or signup",
      errorMessage: req.flash("error"),
      oldInput: { email, password, firstname, surname },
    });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      req.flash("error", "Email already exists, Try another one!");
      return res.status(400).render("auth/loginAndSignup", {
        title: "FB login and signup",
        errorMessage: req.flash("error"),
        oldInput: { email, password, firstname, surname },
      });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    user = new User({
      email,
      password: hashedPass,
      firstname,
      surname,
    });

    await user.save();
    res.redirect("/login");
  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    title: "FB login",
    errorMessage: "",
    oldInput: { email: "", password: "" },
  });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.status(400).render("auth/login", {
      title: "FB login",
      errorMessage: req.flash("error"),
      oldInput: { email, password },
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "E-mail not matched! Try valid E-mail.");
      return res.status(404).render("auth/login", {
        title: "FB login",
        errorMessage: req.flash("error"),
        oldInput: { email, password },
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (isMatched) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      return req.session.save((err) => {
        console.log(err);
        res.redirect("/feed");
      });
    }

    req.flash("error", "Password not matched! Try valid password.");
    return res.status(422).render("auth/login", {
      title: "FB login",
      errorMessage: req.flash("error"),
      oldInput: { email, password },
    });
  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
