const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();  // Ensure you load environment variables

// Create the transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: process.env.USER, // Your email address from environment variables
        pass: process.env.APP_PASSWORD, // Your app-specific password from environment variables
    },
});

router.post('/sendbookingconfirmation', async (req, res) => {
    const { email, bookingDetails } = req.body;

    const mailOptions = {
        from: {
            name: 'Min Lu',
            address: process.env.USER, // Use your email address from environment variables
        },
        to: email,
        subject: "Booking Confirmation",
        text: `Your booking details: ${bookingDetails}.Have a nice day !`,
    };

    try {
        // Use await to ensure the email is sent before sending a response
        await transporter.sendMail(mailOptions);
        res.status(200).send('Email sent successfully');
    } catch (error) {
        console.log("Error occurred while sending email:", error);
        res.status(500).send('Error sending email');
    }
});

module.exports = router;