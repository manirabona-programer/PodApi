const express = require("express");
const Router = new express.Router();
const Podcast = require("../models/podcasts");
const multer = require("multer");
const auth = require("../middleware/auth");

// create podcast for auth users ---------
Router.post("/podcast/create", auth, async (req, res) => {
  const podcast = new Podcast({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await podcast.save();
    res
      .status(200)
      .send({ message: "Your podcast created!", error: false, Podcast });
  } catch (e) {
    res
      .status(400)
      .send({ message: "unable to create the podcast", error: true });
  }
});

// upload podcast profile and audio
const uploadprofile = multer({
  limits: {
    fileSize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|mp3|m4a|wav)$/)) {
      return cb(new Error("Profile Image should be image type"));
    }

    cb(undefined, true);
  },
});

Router.post(
  "/podcast/:id/media",
  auth,
  uploadprofile.fields([{ name: "audio" }, { name: "profile" }]),
  async (req, res) => {
    try {
      const podcast = await Podcast.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            Audio: req.files.audio[0].buffer,
            Profile: req.files.profile[0].buffer,
          },
        },
        { new: true }
      );

      res.send({ message: "podcast medias submitted!", error: false, podcast });
    } catch (e) {
      res
        .status(400)
        .send({ message: "unable to set media for podcast", error: true });
    }
  }
);

// get single podcast
Router.get("/podcast/:id/audio", async (req, res) => {
  try {
    const podcast = await Podcast.findByid(req.params.id);
    if (!podcast || !podcast.Audio) {
      res
        .status(404)
        .send({
          message: "Podcast you are looking for not Exist",
          error: true,
        });
    }

    res.set("Content-Type", "audio/mpeg");
    res.send(podcast.Audio)
  } catch (e) {
    res.status(500).send;
  }
});

// fetch all podacst related to user
Router.get("/podcast", auth, async (req, res) => {
  try {
    await req.user.populate({ path: "podcast" });
    res.send(req.user.podcast);
  } catch (e) {
    res.status(500).send({ message: "unable to get podcasts", error: true });
  }
});

// delete podcast
Router.delete("/podcast/:id", auth, async (req, res) => {
  try {
    const podcast = await Podcast.deleteOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!podcast) {
      res.status(404).send({ message: "not podcast match", error: true });
    }
    res
      .status(200)
      .send({ message: "Podcast deleted!", error: false, podcast });
  } catch (e) {
    res
      .status(400)
      .send({ message: "something went wrong with your id", error: true });
  }
});

// updates the podcast according to user auth and podcast id ------
Router.patch("/podcast/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["Title", "Description"];
  const isValidOperation = updates.every((updateItem) =>
    allowedUpdates.includes(updateItem)
  );

  //  check if is allowed update
  if (!isValidOperation) {
    res.status(400).send({
      message: "You are trying to update invalid fields",
      error: true,
    });
  }

  try {
    const podcast = await Podcast.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!podcast) {
      res.status(404).send({
        message: "data you trying to update don't exist",
        error: true,
      });
    }

    res.send({ message: "Data updated!", error: false });
  } catch (e) {
    res
      .status(500)
      .send({ message: "unable to update your request", error: false });
  }
});

module.exports = Router;
