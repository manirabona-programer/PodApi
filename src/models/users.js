const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    Username: {
      type: String,
      require: true,
      default: "anonymous",
      lowercase: true,
    },
    Email: {
      type: String,
      require: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email not valid");
        }
      },
    },
    Password: {
      type: String,
      require: true,
      minLength: 10,
      lowercase: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password should not include word 'password'");
        }
      },
    },
    avator: {
      type: Buffer,
      require: true,
      default: "buffer",
    },
    Tokens: [
      {
        token: {
          type: String,
          require: true,
          default: "medbjahsj",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function(){
  const user = this;
  const userObj = user.toObject();

  // remove some keys
  delete userObj.__v;
  delete userObj.Tokens;
  delete userObj.Password;

  return userObj;
}

userSchema.virtual('podcast', {
  ref: 'Podcast',
  localField: "_id",
  foreignField: 'owner'
})

// find the user on login request
userSchema.statics.findByCredential = async function (Email, Password) {
  const user = await User.findOne({ Email });
  if (!user) {
    throw new Error();
  }

  const isMatch = await bcrypt.compare(Password, user.Password);
  // if(!isMatch){
  //   throw new Error("Unable to identity you record");
  // }

  return user;
};

// generate user Auth token String
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    "podcast_api_2021_turnel"
  );

  user.Tokens = user.Tokens.concat({ token });
  await user.save();

  return token;
};

// hash the user password before it get saved
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("Password")) {
    user.Password = await bcrypt.hash(user.Password, 8);
  }

  next();
});

const User = mongoose.model("user", userSchema);
module.exports = User;
