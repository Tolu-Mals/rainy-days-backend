const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");


//@route POST api/forgot
//@desc Send a password reset email
//@access Public

router.post('/', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ msg: "Please enter an email" });
      }
    
      User.findOne({ email }).then((user) => {
        if (!user) return res.status(400).json({ msg: "User with this email does not exist" });
    
        if (!user.confirmed)
          return res.status(400).json({ msg: "Please confirm your email first" });
        
        const secret = process.env.jwtSecret + user.password;

        jwt.sign(
            { id: user.id },
            secret,
            { expiresIn: "30m" },
            (err, token) => {
              if (err) throw err;

              async function main() {
                //Send email to user3
                let transporter = nodemailer.createTransport({
                  host: "mail.rainydayssavers.com",
                  port: 465,
                  secure: true,
                  auth: {
                    user: "noreply@rainydayssavers.com",
                    pass: "($FVB3]^TkG[",
                  },
                });

                const url = `https://rainy-days-savers.herokuapp.com/api/forgot/reset/${user.id}/${token}`;

                transporter.sendMail(
                  {
                    from: '"Rainy Days Savers" <noreply@rainydayssavers.com>',
                    to: email,
                    subject: "Reset Password",
                    text: "Password Reset Link",
                    html: `Click <a href="${url}">here</a> to reset your password`,
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

//@route GET api/forgot/reset/:token
//@desc Redirect to password reset page
//@access Public

router.get("/reset/:id/:token", (req, res) => {
    const { token, id } = req.params;
    res.redirect(`https://rainydayssavers.com/forgot/${id}/${token}`);
});

//@route POST api/forgot/reset/:id/:token
//@desc Reset password
//@access Public
router.post("/reset/:id/:token", (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    User.findById(id).then(user => {
        if(!user) res.status(400).json({ msg: "User with email does not exist"})

        try {
            const decoded = jwt.verify(token, process.env.jwtSecret + user.password );
            bcrypt.genSalt(10, (err, salt) => {
                if (err) throw err;
                bcrypt.hash(password, salt, (err, hash) => {
                  if (err) throw err;
                  user.password = hash;
                  user.save().then().catch(err => {
                    res.json({msg: err.message});
                  })
                });
              });
        }
        catch(err){
            res.json({ msg: err.message})
        }
    })
});






module.exports = router;

