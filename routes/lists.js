const router = require("express").Router();
const List = require("../schemas/List");
const verify = require("../verify");

//CREATE

router.post("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    const newList = new List(req.body);
    try {
      const savedList = await newList.save();
      res.status(201).json(savedList);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed!");
  }
});

//DELETE

router.delete("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      await List.findByIdAndDelete(req.params.id);
      res.status(201).json("The list has been delete...");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed!");
  }
});

//update

router.put("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const updatedList = await List.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedList);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed!");
  }
});

//GET

router.get("/", verify, async (req, res) => {
  const typeQuery = req.query.type;
  const genreQuery = req.query.genre;
  let list = [];
  try {
    if (typeQuery) {
      if (genreQuery) {
        list = await List.aggregate([
          { $sample: { size: 10 } },
          { $match: { type: typeQuery, genre: genreQuery } },
        ]);
      } else {
        list = await List.aggregate([
          { $sample: { size: 10 } },
          { $match: { type: typeQuery } },
        ]);
      }
    } else {
      list = await List.aggregate([{ $sample: { size: 10 } }]);
    }
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET with movie items

router.get("/getListRefs", verify, async (req, res) => {
  const typeQuery = req.query.type;
  const genreQuery = req.query.genre;

  let list = [];
  try {
    if (typeQuery) {
      if (genreQuery) {
        list = await List.aggregate([
          { $sample: { size: 10 } },
          { $match: { type: typeQuery, genre: genreQuery } },
          {
            $lookup: {
              from: "movies",
              foreignField: "_id",
              localField: "content",
              as: "content",
            },
          },
        ]);
        //This populate is also working
        // list = await List.find({ type: typeQuery, genre: genreQuery }).populate(
        //   {
        //     path: "content",
        //     options: {
        //       limit: 10,
        //     },
        //   }
        // );
      } else {
        list = await List.aggregate([
          { $sample: { size: 10 } },
          { $match: { type: typeQuery } },
          {
            $lookup: {
              from: "movies",
              foreignField: "_id",
              localField: "content",
              as: "content",
            },
          },
        ]);
      }
    } else {
      //This populate is also working
      // list = await List.find().populate({
      //   path: "content",
      //   options: {
      //     limit: 10,
      //   },
      // });

      list = await List.aggregate([
        [
          {
            $sample: {
              size: 10,
            },
          },
          {
            $lookup: {
              from: "movies",
              foreignField: "_id",
              localField: "content",
              as: "content",
            },
          },
        ],
      ]);
    }

    res.status(200).json(list);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
