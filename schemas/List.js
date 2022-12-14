const mongoose = require("mongoose");

const ListSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    type: { type: String },
    genre: { type: String },
    content: [
      { type: mongoose.Schema.Types.ObjectId, required: false, ref: "movies" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("list", ListSchema);
