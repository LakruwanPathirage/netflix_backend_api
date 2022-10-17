const route = require("express").Router();
const verify = require("../verify");
const CryptoJS = require("crypto-js");
const User = require("../schemas/User");
const router = require("./authRoute");

//UPDATE
route.put("/:id", verify, async (req, res) => {
  if (req.params.id == req.user.id || req.user.isAdmin) {
    try {
      if (req.body.password) {
        const password = CryptoJS.AES.encrypt(
          req.body.password,
          process.env.PASSWORD_SECRET
        ).toString();

        const newupdated1 = await User.findByIdAndUpdate(
          req.params.id,
          {
            $set: { ...req.body, password },
          },
          { new: true }
        );

        res.status(200).json(newupdated1);
      } else {
        let newUpdated2 = await User.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
            password,
          },
          { new: true }
        );

        res.status(200).json(newUpdated2);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("not autherised");
  }
});

route.delete("/:id", verify, async (req, res) => {
  console.log("deleted1");
  if (req.params.id == req.user.id || req.user.isAdmin) {
    try {
      console.log("deleted2");
      await User.findByIdAndDelete(req.params.id);
      console.log("deleted3");
      res.status(200).json("user deleted");
      console.log("deleted4");
    } catch (err) {
      console.log("deleted5", err.message);
      res.status(500).json(err.message);
    }
  } else {
    res.status(403).json("not autherised");
  }
});

//GET

route.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...info } = user._doc;
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL
route.get("/", verify, async (req, res) => {
  const query = req.query.new;
  if (req.user.isAdmin) {
    try {
      const users = query
        ? await User.find().sort({ _id: -1 }).limit(5)
        : await User.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed to see all users!");
  }
});

//GET USER STATS
route.get("/stats", async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);
  console.log("last yr", latYear);
  try {
    const data = await User.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = route;
