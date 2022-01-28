const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");

const User = require("../../models/User");

// @route POST api/onboard/user-info
// @desc Add the first_name, last_name, phone_number and date of birth to the user model
// @access Private

router.post("/user-info", auth, (req, res) => {
  const { id, first_name, last_name, phone_number, dob } = req.body;

  if (!id || !first_name || !last_name || !phone_number || !dob) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  User.findById(id)
    .then((user) => {
      if (!user) return res.status(400).json({ msg: "User does not exist" });

      user.first_name = first_name;
      user.last_name = last_name;
      user.dob = dob;
      user.phone_number = phone_number;
      user
        .save()
        .then(() => {
          res.json({
            email: user.email,
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
          });
        })
        .catch((err) => {
          res.json({ msg: err.message });
        });
    })
    .catch((err) => {
      res.json({ msg: err.message });
    });
});

module.exports = router;
