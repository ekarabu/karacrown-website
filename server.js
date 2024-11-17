require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const sendgrid = require('@sendgrid/mail'); // Import SendGrid
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Your Google reCAPTCHA secret key
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// Set your SendGrid API Key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/verify-recaptcha', async (req, res) => {
    const { token, name, email, message } = req.body;

    try {
        // Verify the reCAPTCHA token with Google's API
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: RECAPTCHA_SECRET_KEY,
                response: token
            }
        });

        if (response.data.success) {
            // Send an email using SendGrid
            const msg = {
                to: 'karacrownpersonal@gmail.com', // Your receiving email address
                from: 'noreply@karacrown.com',     // Your sending email address (should be a verified domain)
                subject: 'New Contact Form Submission',
                text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
            };

            await sendgrid.send(msg);
            res.status(200).send({ success: true, message: 'Email sent successfully!' });
        } else {
            res.status(400).send({ success: false, error: 'Invalid reCAPTCHA token' });
        }
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
