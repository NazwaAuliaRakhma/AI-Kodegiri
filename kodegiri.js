const express = require('express');
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

const API_KEY = process.env.API_KEY;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_KEY_NAME = process.env.SMTP_KEY_NAME;
const SMTP_KEY_VALUE = process.env.SMTP_KEY_VALUE;

// Konfigurasi nodemailer untuk menggunakan SMTP Brevo
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    ciphers: 'SSLv3'
  },
  headers: {
    [SMTP_KEY_NAME]: SMTP_KEY_VALUE,
  }
});

// Fungsi untuk mengirim email
function sendEmail(receiverEmail, subject, body) {
  const mailOptions = {
    from: SMTP_USER,
    to: receiverEmail,
    subject: subject,
    text: body,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

// Endpoint untuk menangani permintaan chat
app.post('/chat', async (req, res) => {
  const { userInput, email, history } = req.body;

  try {
    const responseMessage = await runChat(userInput, history);

    // Kirim email jika parameter email disertakan dalam permintaan
    if (email) {
      sendEmail(email, 'Chatbot Response from PT Kodegiri', responseMessage);
      res.status(200).json({ message: 'Email sent' });
    } else {
      res.status(200).json({ message: responseMessage });
    }
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ message: 'Error processing chat request', error });
  }
});

// Fungsi untuk menjalankan chat menggunakan Google Generative AI (disesuaikan dengan API yang digunakan)
async function runChat(userInput, history) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'YOUR_MODEL_NAME' }); // Sesuaikan nama model yang digunakan

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 500,
  };

  const safetySettings = [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: history || [],
  });

  const response = await chat.sendMessage({
    role: 'user',
    text: userInput,
  });

  let botResponse = response.candidates[0]?.text.trim();

  botResponse = botResponse ? botResponse.replace(/\n/g, '<br><br>') : "Maaf, saya tidak dapat memberikan respons saat ini.";

  return botResponse;
}

// Menjalankan server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
