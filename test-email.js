require('dotenv').config();
const sgMail = require('@sendgrid/mail');

const apiKey = process.env.SENDGRID_API_KEY;
const sender = process.env.SENDER_EMAIL;

console.log("Testing SendGrid...");
console.log("API Key found:", apiKey ? "YES (" + apiKey.substring(0, 5) + "...)" : "NO");
console.log("Sender Email:", sender);

if (!apiKey || !sender) {
    console.error("ERROR: Missing variables in .env file");
    process.exit(1);
}

sgMail.setApiKey(apiKey);

const msg = {
    to: sender, // Send to yourself for testing
    from: sender,
    subject: 'Recall Orchestrator Test Email',
    text: 'If you see this, your SendGrid configuration is working!',
    html: '<strong>If you see this, your SendGrid configuration is working!</strong>',
};

sgMail
    .send(msg)
    .then(() => {
        console.log('SUCCESS: Email sent to ' + sender);
    })
    .catch((error) => {
        console.error('ERROR: Failed to send email');
        console.error(error);
        if (error.response) {
            console.error(error.response.body);
        }
    });
