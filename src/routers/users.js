const express = require("express");
const Router = new express.Router();
const User = require("../models/users");
const auth = require("../middleware/auth");
const multer = require("multer");

// create user // and to database
Router.post(
  "/user/create",
  async (req, res) => {
    const user = new User(req.body);
    try {
      await user.save();
      const token = await user.generateAuthToken();
      res
        .status(201)
        .send({ message: "User created", error: false, user, token });
    } catch (e) {
      res.status(400).send();
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ message: error.message, error: true });
  }
);

// update user profile image
const uploadProfile = multer({
  limits: {
    fileSize: 3000000,
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error("Please user image type"));
    }

    callback(undefined, true);
  },
});
Router.post(
  "/user/me/avatar",
  auth,
  uploadProfile.single("avatar"),
  async (req, res) => {
    try {
      req.user.avator = req.file.buffer;
      await req.user.save();
      res.send({message: "profile image updated!", error: false})
    } catch (e) {
      res
        .status(400)
        .send({ message: "unable to uplift user avator!", error: true });
    }
  }
);

// get user profile image
Router.get("/user/:id/avatar", async (req, res) => {
  try{
    const user = await User.findById(req.params.id);
    res.set('Content-Type', 'image/jpg');
    res.send(user.avator)
  }catch(e){
    res.status(400).send({message: "unable to get user image", error: true})
  }
})

// user login route
Router.get("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredential(req.body.Email, req.body.Password);
    const token = await user.generateAuthToken();
    res.send({ message: "user found", error: false, user, token });
  } catch (e) {
    res.status(404).send({ message: "user not found", error: true });
  }
});

// user logout router
Router.get("/user/logout", auth, async (req, res) => {
  try {
    req.user.Tokens = req.user.Tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res
      .status(200)
      .send({ message: "user logged out", error: false, user: req.user });
  } catch (e) {
    res.status(500).send({ message: "unathenticated access", error: true });
  }
});

module.exports = Router;
