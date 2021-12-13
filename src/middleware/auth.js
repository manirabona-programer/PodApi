const User = require("../models/users");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", ""); // first grab token
    const decoded = jwt.verify(token, "podcast_api_2021_turnel"); // then decode the token string

    // find the specified user with id and token
    const user = await User.findOne({
      _id: decoded._id,
      "Tokens.token": token,
    });

    // if user not found
    if (!user) {
      throw new Error();
    }

    // then parse usefull info to the next
    req.user = user;
    req.token = token;

    next();
  } catch (e) {
    res
      .status(401)
      .send({ Error: "Unauthenticated Access, Please get Authenticate" });
  }
};

module.exports = auth;
