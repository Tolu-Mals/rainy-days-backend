const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const config = require('config');

// @route GET api/confirmation/:token
// @desc Confirm a user's account and redirect to account confirmed page
// @access Public
router.get("/:emailToken", (req, res) => {
  const emailToken = req.params.emailToken;

  const { id } = jwt.verify(emailToken, config.get("emailSecret"));
  User.findById(id)
    .then((user) => {
      user.confirmed = true;
      user.save()
        .then(() => res.redirect('https://www.rainydayssavers.com/confirm'));
    })
    .catch((err) => res
    .status(400).json({ msg: "Failed to confirm account" }));
});


module.exports = router;
