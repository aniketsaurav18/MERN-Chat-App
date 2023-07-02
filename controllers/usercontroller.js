const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const generateToken = require("../utils/tokenGenerator");

exports.registerUser = asyncHandler(async (req, res, next) => {
  const { email, password, name } = req.body;
  if (!name || !password || !name) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  const user = await User.create({
    name,
    email,
    password,
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id, user.email),
    });
  } else {
    res.status(400);
    throw new Error("User cannot be created");
  }
});

exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User Not Found");
  }
  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id, user.email),
    });
  } else {
    res.status(400);
    throw new Error("Incorrect Username or Password");
  }
});

// "/api/user/search?key="
exports.searchUser = asyncHandler(async (req, res, next) => {
  const email = req.query.key;
  if (!email) {
    res.status(400);
    throw new Error("Invalid Request");
  }
  const query = {
    $or: [{ email: { $regex: email, $options: "i" } }],
  };
  try {
    const user = await User.find(query)
      .find({ _id: { $ne: req.user._id } })
      .select("-password -__v");
    if (user.length === 0) {
      res.status(204).json({ message: "User Not Found" });
      next();
    }
    res.status(201).json(user);
  } catch (err) {
    res.status(500);
    console.log(err);
    throw new Error("Server Error");
  }
});
