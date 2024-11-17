require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Your reCAPTCHA keys
const SITE_KEY = '6LcnQ4EqAAAAAPpzeyTqqPO1QQE13so0Hzs7Dpty';
const API_KEY = process.env.API_KEY; // Load API key from environment variables

app.post('/verify-recaptcha', async (req, res) => {
    const { token, action } = req.body;

    try {
        const requestBody = {
            event: {
                token: token,
                expectedAction: action,
                siteKey: SITE_KEY,
            }
        };

        const response = await axios.post(
            `https://recaptchaenterprise.googleapis.com/v1/projects/karacrown-websit-1731811743111/assessments?key=${API_KEY}`,
            requestBody
        );

        if (response.data.tokenProperties && response.data.tokenProperties.valid) {
            res.status(200).send({ success: true, score: response.data.riskAnalysis.score });
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
