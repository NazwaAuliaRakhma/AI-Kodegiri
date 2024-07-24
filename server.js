const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.API_KEY;
const token = '7107200990:AAE6QiLFbyxlsL1iK-9E5tF4eROTaj8XWUI';
const bot = new TelegramBot(token, { polling: true });

const chatHistory = [{
        role: "user",
        parts: [{ text: "kamu adalah chatbot Akif, yang akan membantu menjawab pertanyaan mahasiswa tentang MBKM, tugas akhir dll. Kalo ada yang nanya ruang dosen pa lulu ada di rektorat 402" }],
    },
    {
        role: "model",
        parts: [{ text: "*Tanya:* \"Di mana ruang dosen Pak Lulu?\"\n\n*Jawab:* \"Ruang dosen Pak Lulu berada di Rektorat, Gedung 402.\"" }],
    },
];

async function runChat(userInput) {
    console.log('Received userInput:', userInput);
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1000,
    };

    const safetySettings = [{
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    }];

    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: chatHistory,
    });

    const result = await chat.sendMessage(userInput);
    const response = result.response;

    if (response.text() === "Idk") {
        return "Mohon Maaf kaka, saat ini Akif belum tau jawabannya, mungkin kaka bisa langsung ke ruang Akademik FIF yang ada di DC-205";
    } else {
        return response.text();
    }
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/chat', async(req, res) => {
    try {
        const userInput = req.body.userInput;
        console.log('Incoming /chat req', userInput);
        if (!userInput) {
            console.error('Invalid request body:', req.body);
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const response = await runChat(userInput);
        res.json({ response });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

bot.on('message', async(msg) => {
    const chatId = msg.chat.id;
    const userInput = msg.text.toString().trim();
    const response = await runChat(userInput);
    bot.sendMessage(chatId, response);
});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const guide = "Selamat datang di Akif Bot";
    bot.sendMessage(chatId, guide);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});