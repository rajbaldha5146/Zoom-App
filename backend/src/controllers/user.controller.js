import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";
const login = async (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (username.trim().length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    try {
        const user = await User.findOne({ username: username.trim() });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid username or password" });
        }

        let isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString("hex");
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid username or password" });
        }

    } catch (e) {
        console.error("Login error:", e);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
}


const register = async (req, res) => {
    const { name, username, password } = req.body;

    // Input validation
    if (!name || !username || !password) {
        return res.status(400).json({ message: "Name, username, and password are required" });
    }

    if (name.trim().length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (username.trim().length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    try {
        const existingUser = await User.findOne({ username: username.trim() });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name.trim(),
            username: username.trim(),
            password: hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "Account created successfully! Please sign in." });

    } catch (e) {
        console.error("Registration error:", e);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}


const getUserHistory = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }
        
        const meetings = await Meeting.find({ user_id: user.username });
        res.json(meetings);
    } catch (e) {
        console.error("Get history error:", e);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    if (!token || !meeting_code) {
        return res.status(400).json({ message: "Token and meeting code are required" });
    }

    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code.trim()
        });

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added to history" });
    } catch (e) {
        console.error("Add to history error:", e);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}


export { login, register, getUserHistory, addToHistory }