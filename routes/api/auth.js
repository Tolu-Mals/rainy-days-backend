const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");
const axios = require("axios");

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
              email: user.email
            },
          });
        }
      );
    });
  });
});

//@route GET api/auth/user
//@desc get user's data: id and email
//@access private

router.get("/user", auth, (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then((user) =>
      res.json({
        id: user.id,
        email: user.email
      })
    );
});


//@route GET api/auth/customer
//@desc get user(customer) data: first_name, last_name, phone_number, customer_code using paystack api
//@access private

router.get("/customer/:email", auth, (req, res) => {
  const email = req.params.email;

  console.log(email)

  const options = {
    headers: {
      Authorization: `Bearer ${process.env.secretKey}`
    }
  }

  axios.get(`https://api.paystack.co/customer/${email}`, options)
  .then((response) => {
    res.send(response.data.data);
  })
  .catch(error => {
    res.json({ msg: error.message })
  })
});


module.exports = router;
