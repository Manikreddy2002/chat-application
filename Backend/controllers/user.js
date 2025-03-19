import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { user as user } from "../models/usermodel.js";

// Load environment variables
dotenv.config();

// Register Function
export const register = async (req, res) => {
    try {
        const { fullname, username, password, confirmpassword, gender } = req.body;

        // Validate the required fields
        if (!fullname || !username || !password || !confirmpassword || !gender) {
            return res.status(400).json({ msg: "Please fill in all fields" });
        }

        // Check if the passwords match
        if (password !== confirmpassword) {
            return res.status(400).json({ message: "Passwords do not match, please try again" });
        }

        // Check if the username already exists
        const existingUser = await user.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists, please try again" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Define profile photo based on gender
        const maleProfilePhoto = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const femaleProfilePhoto = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        // Create the user
        const newUser = await user.create({
            fullname,
            username,
            password: hashedPassword,
            profilephoto: gender === "male" ? maleProfilePhoto : femaleProfilePhoto,
            gender,
        });

        // Return success response
        return res.status(201).json({ message: "User registered successfully", user: newUser });

    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Server error, please try again later" });
    }
};

// Login Function
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate that both username and password are provided
        if (!username || !password) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        // Find the user by username
        const existingUser = await user.findOne({ username });  // Correct use of the user model

        // Check if the user exists
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Check if the password exists
        if (!existingUser.password) {
            return res.status(400).json({ message: "No password found for this user" });
        }

        // Compare the provided password with the stored hashed password
        const isValidPassword = await bcrypt.compare(password, existingUser.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Generate a JWT token
        const tokenData = { id: existingUser.id, username: existingUser.username }; // Use the correct user data
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        // Send the token as a cookie and return user details
        return res.status(200)
            .cookie("token", token, {
                maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day in milliseconds
                httpOnly: true,
                sameSite: 'strict'
            })
            .json({
                _id: existingUser.id,
                username: existingUser.username,
                profilephoto: existingUser.profilephoto,
                fullname: existingUser.fullname
            });

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Logout Function
export const logout = (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully" });
};
