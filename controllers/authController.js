import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js'
import nodemailer from 'nodemailer'

export const signupUser   = async (req, res) => {
    try {
        const { title, username, name, email, password, middle_name, last_name } = req.body;

        if (!title || !username || !name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const existingUsername = await userModel.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "User with this username already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new userModel({
            title,
            username,
            name,
            middle_name,
            last_name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: "User signed up successfully",
            user: {
                id: newUser._id,
                title: newUser.title,
                username: newUser.username,
                name: newUser.name,
                middle_name: newUser.middle_name,
                last_name: newUser.last_name,
                contact_no: newUser.contact_no,
                email: newUser.email
            },
            token
        });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log(error);
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await userModel.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }
        
        if (user.isBlocked) {
            return res.status(403).json({ message: "Your account is banned by the admin." });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Wrong password." });
        }


        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '30d' } // Token valid for 30 days
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                title: user.title,
                name: user.name,
                middle_name: user.middle_name,
                last_name: user.last_name,
                contact_no: user.contact_no,
                email: user.email,
                isActive: user.isActive,
                role: user.role,
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const userVerifyByEmail = async (req, res) => {
    try {
        const { email, username, userId } = req.body;

        if (!email || !username || !userId) {
            return res.status(400).json({ message: "Email, username, and userId are required" });
        }

        // Generate JWT token for verification
        const token = jwt.sign(
            { id: userId, email: email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" } // Token valid for 1 day
        );

        const verifyLink = `http://localhost:3000/api/verify?token=${token}`;

        // Setup email transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "shahbazansari8199@gmail.com",
                pass: 'nyaj zfxg ktjr iztq'
            },
        });

        // Send email
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Welcome to Health Monitor System – Verify Your Email`,
            text: `Dear ${username},

Thank you for registering with the Health Monitor System! To complete your registration and activate your account, please verify your email by clicking the button below:`,

            html: `
  <p>Dear ${username},</p>
  <p>Thank you for registering with the Health Monitor System! To complete your registration and activate your account, please verify your email by clicking the button below:</p>
  <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: skyblue; text-decoration: none; border-radius: 5px;">Activate Account</a>
  <p>If you did not sign up for an account, please ignore this email.</p>
  <p>For any assistance, feel free to contact our support team.</p>
  <p>Best regards,<br>Health Monitor System Team</p>
`       });

        console.log("Message sent: %s", info.messageId);
        res.status(200).json({ message: "Verification email sent successfully!" });

    } catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({ error: "Failed to send verification email" });
    }
};

export const verifyUser = async (req, res) => {
    try {
        const { token } = req.query;
        console.log(token);
        if (!token) {
            return res.status(400).json({ message: "Invalid or missing token" });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.isActive) {
            return res.status(400).json({ message: "Account is already verified" });
        }

        // Activate the user
        user.isActive = true;
        await user.save();

        // ✅ Redirect to frontend dashboard
        return res.redirect(`http://127.0.0.1:5500/account-verified.html`);
        res.send('a')

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Invalid or expired token" });
    }
};