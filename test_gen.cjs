
const https = require('https');

const apiKey = "AIzaSyBhDJtIKxA-wjYQP7twaRjj_m5Cwgk6L8Y";
// Testing gemini-2.0-flash (Stable)
const model = "gemini-2.0-flash";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const data = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: "Hello" }] }]
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(url, options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => responseBody += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        try {
            const json = JSON.parse(responseBody);
            if (json.error) {
                console.error("API Error:", JSON.stringify(json.error, null, 2));
            } else {
                console.log("Success! Response:", json.candidates?.[0]?.content?.parts?.[0]?.text);
            }
        } catch (e) {
            console.log("Raw Response:", responseBody);
        }
    });
});

req.on('error', (e) => {
    console.error("Request Error:", e);
});

req.write(data);
req.end();
