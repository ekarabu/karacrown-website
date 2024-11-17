require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const sendgrid = require('@sendgrid/mail');
const cors = require('cors'); // Import cors
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your frontend domain or temporarily allow all origins for testing
app.use(cors({
    origin: '*', // Temporarily allow all origins for testing. Change to 'https://www.karacrown.com' in production
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// Load API keys and log for debugging
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (RECAPTCHA_SECRET_KEY) {
    console.log("RECAPTCHA_SECRET_KEY: Loaded");
} else {
    console.error("RECAPTCHA_SECRET_KEY is missing!");
}
if (SENDGRID_API_KEY) {
    console.log("SENDGRID_API_KEY: Loaded");
    sendgrid.setApiKey(SENDGRID_API_KEY);
} else {
    console.error("SENDGRID_API_KEY is missing!");
}

app.post('/verify-recaptcha', async (req, res) => {
    const { token, name, email, message } = req.body;

    try {
        // Verify the reCAPTCHA token with Google's API
        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: RECAPTCHA_SECRET_KEY,
                response: token
            }
        });

        if (response.data.success) {
            console.log("reCAPTCHA verification successful");

            // Send an email using SendGrid
            const msg = {
                to: 'karacrownpersonal@gmail.com',
                from: 'noreply@karacrown.com',
                subject: 'New Contact Form Submission',
                text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
            };

            await sendgrid.send(msg);
            console.log("Email sent successfully");
            res.status(200).send({ success: true, message: 'Email sent successfully!' });
        } else {
            console.error("Invalid reCAPTCHA token", response.data);
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
