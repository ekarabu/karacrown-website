require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Use the correct secret key from your environment variables
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

app.post('/verify-recaptcha', async (req, res) => {
    const { token } = req.body;

    try {
        // Verify the reCAPTCHA token with Google's API
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: RECAPTCHA_SECRET_KEY,
                response: token
            }
        });

        if (response.data.success) {
            res.status(200).send({ success: true, score: response.data.score });
        } else {
            res.status(400).send({ success: false, error: 'Invalid token' });
        }
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
