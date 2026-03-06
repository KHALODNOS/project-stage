const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  username: { type: String, unique: true, sparse: true },
  nickname: { type: String, sparse: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: String,
  adress: String,
  city: String,
  age: Number,
  bio: String,
  role: {
    type: String,
    enum: ["admin", "translator", "user"],
    default: "user",
  },
  birthday: Date,
  image: { type: String, default: "images.png" },
  favorite: [{ type: mongoose.Schema.Types.ObjectId, ref: "Novel" }],
  NovelsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Novel" }],
  Lastview: [
    {
      chapterNumber: Number,
      novel: { type: mongoose.Schema.Types.ObjectId, ref: "Novel" },
    },
  ],
  ChaptersCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  emailOTP: String,
  phoneOTP: String,
  onboardingCompleted: { type: Boolean, default: false },
  registrationStep: { type: Number, default: 1 },
});

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.username) {
    const existingUser = await mongoose.models.User.findOne({
      username: user.username,
      _id: { $ne: user._id },
    });
    if (existingUser) {
      const error = new Error("Duplicate username");
      error.name = "Duplicate username";
      return next(error);
    }
  }

  if (user.email && (user.isModified("email") || user.isNew)) {
    const existingemail = await mongoose.models.User.findOne({
      email: user.email,
      _id: { $ne: user._id },
    });
    if (existingemail) {
      const error = new Error("Duplicate email");
      error.name = "Duplicate email";
      return next(error);
    }
  }

  next();
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
  }
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
