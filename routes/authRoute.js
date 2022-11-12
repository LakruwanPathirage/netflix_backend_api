const router = require("express").Router();
const User = require("../schemas/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  const password = CryptoJS.AES.encrypt(
    req.body.password,
    process.env.PASSWORD_SECRET
  ).toString();

  try {
    const newUser = new User({ ...req.body, password });
    const user = await newUser.save();

    res.status(201).json(user);
  } catch (err) {
    res.status(200).json("user created");
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(403).json("Wrong password or username");
      return;
    }

    const bytes = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECRET
    );
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== req.body.password) {
      res.status(401).json("Wrong password or username!");
    }

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "5d" }
    );

    const { password, ...info } = user._doc;

    res.status(200).json({ ...info, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
