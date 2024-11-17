require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const sendgrid = require('@sendgrid/mail');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS with improved configuration
app.use(cors({
    origin: 'https://www.karacrown.com', // Replace with your actual frontend domain
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true // Allow credentials if needed
}));

app.use(bodyParser.json());

// Debugging: Log environment variables to ensure they are set
console.log("RECAPTCHA_SECRET_KEY:", process.env.RECAPTCHA_SECRET_KEY ? "Loaded" : "Not Loaded");
console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "Loaded" : "Not Loaded");

// Set up SendGrid API key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/verify-recaptcha', async (req, res) => {
    const { token, name, email, message } = req.body;

    try {
        // Debugging: Log incoming request data
        console.log("Received request:", { token, name, email, message });

        // Verify the reCAPTCHA token with Google's API
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: token
            }
        });

        console.log("reCAPTCHA verification response:", response.data);

        if (response.data.success) {
            // Send an email using SendGrid
            const msg = {
                to: 'karacrownpersonal@gmail.com',
                from: 'noreply@karacrown.com',
                subject: 'New Contact Form Submission',
                text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
            };

            // Debugging: Log the email message
            console.log("Sending email with message:", msg);

            await sendgrid.send(msg);
            res.status(200).send({ success: true, message: 'Email sent successfully!' });
        } else {
            console.error("reCAPTCHA verification failed:", response.data['error-codes']);
            res.status(400).send({ success: false, error: 'Invalid reCAPTCHA token' });
        }
    } catch (error) {
        console.error("Error in /verify-recaptcha:", error);
        res.status(500).send({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
