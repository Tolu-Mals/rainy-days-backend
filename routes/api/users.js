const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');

const User = require("../../models/User");

const { google } = require("googleapis");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

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
            process.env.emailSecret,
            { expiresIn: "7d" },
            (err, emailToken) => {
              if (err) throw err;

              const url = `https://rainy-days-savers.herokuapp.com/api/confirmation/${emailToken}`;

              async function main() {
                //Send email to user
                const acessToken = await oAuth2Client.getAccessToken();

                let transporter = nodemailer.createTransport({
                  service: "gmail",
                  auth: {
                    type: "OAuth2",
                    user: "rainydayssaversweb@gmail.com",
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    acessToken,
                  },
                });

                const mailOptions = {
                  from: '"Rainy Days Savers" <rainydayssaversweb@gmail.com>',
                  to: email,
                  subject: "Confirm Account",
                  text: "Click the link to confirm your rainy days account",
                  html: `Click <a href="${url}">here</a> to confirm your account <br> `,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                  
                  if (error) {
                    console.log(error.message)
                    res.status(400).json({ msg: error?.message });
                  }
                  console.log(info);
                  res.json({ info });
                });
              }

              main().catch((err) => {
                console.log(err?.message);
                res.json({ msg: err?.message });
              });
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
      process.env.emailSecret,
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

        main().catch((error) => {
          console.log(error.message)
        });
      }
    );
  });
});

module.exports = router;
