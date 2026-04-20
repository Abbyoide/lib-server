import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
export const testAuth = (req, res) => {
    res.send("auth is oky");
};
const SECRET = process.env.JWT_SECRET;
export const register = async (req, res) => {
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
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id, email: user.email }, SECRET, {
            expiresIn: "1h",
        });
        res.json({ token });
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
//# sourceMappingURL=auth.controller.js.map