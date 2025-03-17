const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Admin } = require("../models");
require("dotenv").config();

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "All fields are required!",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Admin.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      status: "success",
      message: "Admin created successfully!",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        status: "fail",
        message: "Email or username already exists!",
      });
    }
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
    console.log(err);
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Email and password are required!",
    });
  }

  try {
    const user = await Admin.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password!",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password!",
      });
    }

    // Generate JWT
    const token = generateToken(user);

    res.status(200).json({
      status: "success",
      message: "Login successful!",
      token,
    });
  } catch (err) {
    console.error("Error during signin:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { old_password, new_password } = req.body;
    const { email } = req.user;

    const admin = await Admin.findOne({ where: { email: email } });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const passwordMatch = await bcrypt.compare(old_password, admin.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid old password" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res
      .status(500)
      .json({ message: "Failed to change password", error: error });
  }
};
