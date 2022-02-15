const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const axios = require("axios");

// @route POST api/onboard/user-info
// @desc Add the first_name, last_name, phone_number and date of birth to the user model
// @access Private

router.post("/user-info", auth, (req, res) => {
  const { email, first_name, last_name, phone_number } = req.body;

  if (!email || !first_name || !last_name || !phone_number) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  const body = JSON.stringify({
    email,
    first_name,
    last_name,
    phone: phone_number,
  });

  const options = {
    headers: {
      Authorization: `Bearer ${process.env.secretKey}`,
      "Content-Type": "application/json",
    },
  };

  axios
    .post("https://api.paystack.co/customer", body, options)
    .then((response) => {
      console.log(response.message);
      res.json({
        first_name,
        last_name,
        phone_number,
        customer_code: response.data.data.customer_code,
      });
    })
    .catch((err) => {
      console.log(err.message);
      res.json({ msg: 'An error occurred'})
    });
});

module.exports = router;
