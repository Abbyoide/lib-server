import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

export const testAuth = (req: Request, res: Response) => {
  res.send("auth is ok");
};

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }
  return secret;
};

export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, username, email, password } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashed,
    });

    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err: any) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      message: "Server error",
      error: err?.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { identifier, email, username, password } = req.body;

  try {
    console.log("LOGIN BODY:", req.body);

    const loginValue = identifier || email || username;

    if (!loginValue || !password) {
      return res.status(400).json({
        message: "Email/username and password are required",
      });
    }

    const user = await User.findOne({
      $or: [{ email: loginValue }, { username: loginValue }],
    });

    console.log("USER FOUND:", user);

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      getSecret(),
      { expiresIn: "1h" },
    );

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      message: "Server error",
      error: err?.message || err,
    });
  }
};
