import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret)
    throw new Error("JWT_SECRET is missing in environment variables");
  return secret;
};

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

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

    const user = new User({ username, email, password: hashed });
    await user.save();

    const SECRET = getSecret();

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      SECRET,
      { expiresIn: "1h" },
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err?.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { identifier, email, username, password } = req.body;

  try {
    const loginValue = identifier || email || username;

    if (!loginValue || !password) {
      return res
        .status(400)
        .json({ message: "Email/username and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: loginValue }, { username: loginValue }],
    });

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const SECRET = getSecret();

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      SECRET,
      { expiresIn: "1h" },
    );

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "Server error", error: err?.message });
  }
};
