require("dotenv").config();
const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Sequence = require("../models/increase");
const { deleteImage, uploadImage } = require("../config/storage");
const { authorize, authenticate } = require("../middleware/middleware");
const multer = require("multer");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB limit
});

const router = Router();
const secretaccessToken = process.env.ACCESS_JWT; // Use a more secure way to store secrets
const secretrefreshToken = process.env.REFRESH_JWT; // Use a more secure way to store secrets

// Function to get the next number value for user
const getNextSequenceValue = async (sequenceName) => {
  const sequenceDoc = await Sequence.findOneAndUpdate(
    { model: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return sequenceDoc.seq;
};

router.post("/check", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!password) {
      return res.status(400).send({ message: "password f" });
    }

    const userExists =
      (await User.findOne({ username })) || (await User.findOne({ email }));
    if (userExists) {
      return res
        .status(400)
        .send({ message: "Username or email already exists" });
    }

    res.status(200).send({ message: "Username and email are available" });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Step 1: Email & Password
router.post("/register/step1", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Step 1 Request Body:", { email, hasPassword: !!password });

    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Email clash: ${email}`);
      return res.status(400).send({ message: "Email already exists" });
    }

    const otp = generateOTP();
    const userId = await getNextSequenceValue("User");
    console.log(`Generated User ID: ${userId}`);

    const user = new User({
      id: userId,
      email,
      password,
      emailOTP: otp,
      registrationStep: 1,
      username: undefined, // Ensure sparse index ignores these
      nickname: undefined,
    });

    try {
      await sendEmail(email, otp);
      console.log(`Email OTP sent successfully to ${email}`);
    } catch (emailError) {
      console.error("Non-blocking Email Error:", emailError.message);
      console.log(`\n--- EMAIL OTP FOR ${email} (Fallback) ---`);
      console.log(`OTP: ${otp}`);
      console.log(`-----------------------------------------\n`);
    }

    await user.save();
    console.log(`User created (Step 1): ${email}`);
    res.status(200).send({ message: "OTP generated", email });
  } catch (error) {
    console.error("CRITICAL Registration Step 1 Error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Step 2: Verify Email OTP
router.post("/register/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(`Verifying email OTP for: ${email}`);
    const user = await User.findOne({ email });

    if (!user || user.emailOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.emailVerified = true;
    user.emailOTP = null;
    user.registrationStep = 2;
    await user.save();

    console.log(`Email verified: ${email}`);
    res.json({ message: "Email verified successfully", email });
  } catch (error) {
    console.error("Verify Email Error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Step 3: Phone Number Verification
router.post("/register/step3-phone", async (req, res) => {
  try {
    const { email, phone } = req.body;
    console.log(`Step 3 Phone Request: ${email}, ${phone}`);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const phoneOtp = generateOTP();
    user.phone = phone;
    user.phoneOTP = phoneOtp;
    user.registrationStep = 3;

    console.log(`\n--- PHONE OTP FOR ${email} ---`);
    console.log(`OTP: ${phoneOtp}`);
    console.log(`--------------------------------\n`);

    await user.save();
    res.json({ message: "Phone OTP generated and printed to server console" });
  } catch (error) {
    console.error("Step 3 Phone Error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Verify Phone OTP
router.post("/register/verify-phone", async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(`Verifying phone OTP for: ${email}`);
    const user = await User.findOne({ email });

    if (!user || user.phoneOTP !== otp) {
      return res.status(400).json({ message: "Invalid Phone OTP" });
    }

    user.phoneVerified = true;
    user.phoneOTP = null;
    user.registrationStep = 4;
    await user.save();

    console.log(`Phone verified: ${email}`);
    res.json({ message: "Phone verified successfully" });
  } catch (error) {
    console.error("Verify Phone Error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Step 4: Upload Profile Photo
router.post(
  "/register/step4-photo",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { email } = req.body;
      console.log(`Step 4 Photo Upload for: ${email}`);
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let imageUrl = "users/images.png";
      if (req.file) {
        imageUrl = await uploadImage(req.file, "users");
        console.log(`Uploaded image: ${imageUrl}`);
      }

      user.image = imageUrl;
      user.registrationStep = 5;
      await user.save();

      res.json({ message: "Profile photo uploaded", imageUrl });
    } catch (error) {
      console.error("Step 4 Photo Error:", error);
      if (
        error instanceof multer.MulterError &&
        error.code === "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(400)
          .json({ message: "File size too large. Max size is 1 MB." });
      }
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  },
);

// Step 5: Complete Profile
router.post("/register/complete", async (req, res) => {
  try {
    const { email, username, nickname, bio, birthday, adress, city, age } =
      req.body;
    console.log(`Completing profile for: ${email}, username: ${username}`);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Set role for the first user
    const userCount = await User.countDocuments();
    if (userCount <= 1) {
      user.role = "admin";
    }

    user.username = username;
    user.nickname = nickname;
    user.bio = bio;
    user.birthday = birthday;
    user.adress = adress;
    user.city = city;
    user.age = age;
    user.registrationStep = 6;
    user.onboardingCompleted = true;

    await user.save();
    console.log(`Registration completed for: ${email}`);
    res.json({ message: "Registration completed successfully" });
  } catch (error) {
    console.error("Complete Registration Error:", error);
    if (error.name === "Duplicate username") {
      return res.status(400).json({ message: "Username already exists" });
    }
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ message: "معلومات الدخول غير صحيحة" });
    }
    user.password = "";
    const userId = user._id;
    const accessToken = jwt.sign({ userId, username }, secretaccessToken, {
      expiresIn: "10s",
    });
    const refreshToken = jwt.sign({ userId }, secretrefreshToken, {
      expiresIn: "1h",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    //   res.cookie('refreshToken', refreshToken, {
    //     httpOnly: true,
    //     secure: true, // Set to true in production
    //     sameSite: 'None'
    // });
    console.log("Set-Cookie:", res.getHeader("Set-Cookie"));

    //for get expires of accesstoken
    jwt.verify(accessToken, secretaccessToken, async (err, decoded) => {
      const exp = decoded.exp;

      res.send({ accessToken, user, exp });
    });
    // res.send({ accessToken,userId,role,refreshToken});
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route to refresh access token
router.post("/token", (req, res) => {
  // Check if refresh token is being sent in the request
  console.log("Cookies:", req.cookies);
  const refreshToken = req.cookies.refreshToken;
  // console.log(refreshToken)
  if (!refreshToken) return res.status(402).send("Refresh token required");
  jwt.verify(refreshToken, secretrefreshToken, async (err, decoded) => {
    if (err) return res.status(403).send("Invalid refresh token");
    const user = await User.findById(decoded.userId).select("-password"); // Exclude the password field
    if (!user) return res.status(404).send({ message: "User not found" });
    const userId = user._id;
    const username = user.username;

    const accessToken = jwt.sign({ userId, username }, secretaccessToken, {
      expiresIn: "10s",
    });

    //for get expires of accesstoken
    jwt.verify(accessToken, secretaccessToken, async (err, decoded) => {
      const exp = decoded.exp;

      res.send({ accessToken, user, exp });
    });
  });
});
// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.sendStatus(204);
});

// //Update  user
// router.put('/:id', async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//     if (!user) return res.status(404).send({ message: 'user not found' });
//     res.send(user);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

module.exports = router;
