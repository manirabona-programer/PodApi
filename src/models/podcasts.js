const mongoose = require("mongoose");

const podcastSchema = new mongoose.Schema(
  {
    Title: {
      type: String,
      require: true,
      lowercase: true,
    },
    Description: {
      type: String,
      default: "none yet",
    },
    Audio: {
      type: Buffer,
      require: true,
      default: "none yet",
    },
    Profile: {
      type: Buffer,
      require: true,
      default: "none yet",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
    },
  },
  { timestamps: true }
);

podcastSchema.methods.toJSON = function(){
  const podcast = this;
  const podObj = podcast.toObject();

  delete podObj.__v;

  return podObj;
}

const Podcasts = mongoose.model("Podcast", podcastSchema);
module.exports = Podcasts;
