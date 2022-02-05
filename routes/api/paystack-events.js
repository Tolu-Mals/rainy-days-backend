const express = require('express');
const router = express.Router();

//@route POST api/paystack-events/
//@desc webhook to receive paystack events
//@access public

router.post("/", (req, res) => {
    const event = req.body;

    console.log(event);
});


module.exports = router;