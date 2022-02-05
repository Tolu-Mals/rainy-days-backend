const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");

const User = require("../../models/User");

//@route POST api/auth
//@desc Authenticate(login) a user
//@access Public

router.post("/", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  User.findOne({ email }).then((user) => {
    if (!user) return res.status(400).json({ msg: "User does not exist" });

    if (!user.confirmed)
      return res.status(400).json({ msg: "Please confirm your email first" });

    bcrypt.compare(password, user.password).then((isMatch) => {
      if (!isMatch) return res.status(400).json({ msg: "Incorrect password" });

      jwt.sign(
        { id: user.id },
        process.env.jwtSecret,
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.id,
              email: user.email,
              first_name: user.first_name,
              isLastNameSaved: user.last_name ? true : false,
              isFirstNameSaved: user.first_name ? true : false,
              isDobSaved: user.dob ? true : false,
              isBankInfoSaved: user.bank_information ? true : false,
              isTransactionPinSet: user.transaction_pin ? true : false,
            },
          });
        }
      );
    });
  });
});

//@route GET api/auth/userk
//@desc get user's data
//@access private

router.get("/user", auth, (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then((user) =>
      res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        isLastNameSaved: user.last_name ? true : false,
        isFirstNameSaved: user.first_name ? true : false,
        isDobSaved: user.dob ? true : false,
        isBankInfoSaved: user.bank_information ? true : false,
        isTransactionPinSet: user.transaction_pin ? true : false,
      })
    );
});

module.exports = router;
