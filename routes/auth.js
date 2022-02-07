const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetchUser");

const router = express.Router();
const secretkey = "Himanshu'sSecret";

// ROUTE 1 - Creating user with POST api on '/api/auth/createUser' endpoint.
router.post(
  "/createUser",
  [
    // name must be at least 3 chars long.
    body("name", "Custom message for error can be given here").isLength({
      min: 3,
    }),
    // email must be an email.
    body("email", "Enter a valid email").isEmail(),
    // password must be at least 5 chars long.
    body("password", "Password must be > 5 characters.").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // {const user = User(req.body);} ->  1st way to store.
    // user.save();
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user != null) {
        return res
          .status(400)
          .json({ error: "Email is already registered with another user!" });
      }
      const salt = bcrypt.genSaltSync(10);
      const secPass = await bcrypt.hashSync(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      }).catch((err) => res.json({ error: "Something went wrong!" }));

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, secretkey);

      res.json({ authtoken });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: e.message });
    }
  }
);

// ROUTE 2: Loggin user with POST api on '/api/auth/login' endpoint.
router.post(
  "/login",
  [
    // email must be an email.
    body("email", "Enter a valid email").isEmail(),
    // password can not be empty.
    body("password", "password can not be empty.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Check whether the user exists or not.
      const { email, password } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ error: "Please Login With Correct Credentials!" });
      }
      // If the user is found, compare the password entered with the one which is stored on the server. Verify password.
      const passwordVerif = bcrypt.compareSync(password, user.password);
      if (!passwordVerif) {
        return res
          .status(404)
          .json({ error: "Please Login With Correct Credentials!" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, secretkey);

      res.json({ authtoken });
    } catch (error) {
      console.log(e);
      res.status(500).json({ message: e.message });
    }
  }
);

// ROUTE 3: Fetching logged in user details woth 'api/auth/getuser'

router.post("/getUser/", fetchUser, async (req, res) => {
  try {
    userid = req.user.id;
    let user = await User.findById(userid).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
