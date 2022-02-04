const express = require("express");
const User = require("../models/User");

const router = express.Router();


//Creating user with POST api on '/api/auth' endpoint
router.post("/createUser", (req, res) => {
  console.log(req.body);
  const user = User(req.body);
  user.save();
  res.json(req.body);
});

module.exports = router;
