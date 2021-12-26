const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const config = require("config");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");

// @route POST api/users
// @desc Register a new user
// @access Public
router.post("/", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  if (!/^(?=.*?[A-Za-z0-9])(?=.*?[#?!@$%^&*-]).{6,}$/gm.test(password)) {
    return res.status(400).json({
      msg: "Password must be up to 6 characters and must contain one symbol",
    });
  }

  User.findOne({ email }).then((user) => {
    if (user) return res.status(400).json({ msg: "User already exists" });

    const newUser = new User({
      email,
      password,
    });

    bcrypt.genSalt(10, (err, salt) => {
      if (err) throw err;
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save().then(async (user) => {
          jwt.sign(
            { id: user.id },
            config.get("emailSecret"),
            { expiresIn: "7d" },
            (err, emailToken) => {
              if (err) throw err;

              async function main() {
                //Send email to user

                let transporter = nodemailer.createTransport({
                  host: "mail.rainydayssavers.com",
                  port: 465,
                  secure: true,
                  auth: {
                    user: "noreply@rainydayssavers.com",
                    pass: "($FVB3]^TkG[",
                  },
                });

                const url = `https://rainy-days-savers.herokuapp.com/api/confirmation/${emailToken}`;

                transporter.sendMail(
                  {
                    from: '"Rainy Days Savers" <noreply@rainydayssavers.com>',
                    to: email,
                    subject: "Confirm Account",
                    text: "Click the link to confirm your rainy days account",
                    html: `Click <a href="${url}">here</a> to confirm your account <br> `,
                  },
                  (error, info) => {
                    if (error) {
                      res.status(400).json({ error: error.message });
                    }
                    res.json({ info });
                  }
                );
              }

              main().catch(console.error);
            }
          );
        });
      });
    });
  });
});

// @route POST api/users/confirm
// @desc Send account confirmation link to user
// @access Public
router.post("/", (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  User.findOne({ email }).then((user) => {
    if (!user) return res.status(400).json({ msg: "Email not yet registered" });
    jwt.sign(
      { id: user.id },
      config.get("emailSecret"),
      { expiresIn: "7d" },
      (err, emailToken) => {
        if (err) throw err;

        async function main() {
          //Send email to user

          let transporter = nodemailer.createTransport({
            host: "mail.rainydayssavers.com",
            port: 465,
            secure: true,
            auth: {
              user: "noreply@rainydayssavers.com",
              pass: "($FVB3]^TkG[",
            },
          });

          const url = `https://rainy-days-savers.herokuapp.com/api/confirmation/${emailToken}`;

          transporter.sendMail(
            {
              from: '"Rainy Days Savers" <noreply@rainydayssavers.com>',
              to: email,
              subject: "Confirm Account",
              text: "Click the link to confirm your rainy days account",
              html: `Click <a href="${url}">here</a> to confirm your account <br> `,
            },
            (error, info) => {
              if (error) {
                res.status(400).json({ error: error.message });
              }
              res.json({ info });
            }
          );
        }

        main().catch(console.error);
      }
    );
  });
});

module.exports = router;
