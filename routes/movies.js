const router = require("express").Router();
const Movie = require("../schemas/Movie");
const verify = require("../verify");

//CREATE

router.post("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    const newMovie = new Movie(req.body);
    try {
      const savedMovie = await newMovie.save();
      res.status(201).json(savedMovie);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed!");
  }
});

//UPDATE

router.put("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const updatedMovie = await Movie.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedMovie);
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
      await Movie.findByIdAndDelete(req.params.id);
      res.status(200).json("The movie has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed!");
  }
});

//GET

router.get("/find/:id", verify, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.status(200).json(movie);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET RANDOM

router.get("/random", verify, async (req, res) => {
  const type = req.query.type;
  const genere = req.query.genre;
  console.log("gnere", genere);
  let movie;
  try {
    if (type === "series") {
      if (genere) {
        console.log("series and yes genre");
        movie = await Movie.aggregate([
          { $match: { isSeries: true, genre: genere } },
          { $sample: { size: 1 } },
        ]);
      } else {
        console.log("series and no genre");
        movie = await Movie.aggregate([
          { $match: { isSeries: true } },
          { $sample: { size: 1 } },
        ]);
      }
    } else {
      if (genere) {
        console.log("movies and yes genre");
        movie = await Movie.aggregate([
          { $match: { isSeries: false, genre: genere } },
          { $sample: { size: 1 } },
        ]);
      } else {
        console.log("movies and no genre");
        movie = await Movie.aggregate([
          { $match: { isSeries: false } },
          { $sample: { size: 1 } },
        ]);
      }
    }

    res.status(200).json(movie);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL

router.get("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const movies = await Movie.find();
      res.status(200).json(movies.reverse());
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed!");
  }
});

module.exports = router;
