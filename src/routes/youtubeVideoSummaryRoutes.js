import express from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import { OpenAIApi, Configuration } from 'openai';
import { validateAndExtractVideoId, extractTextFromTranscript } from '../utils/index.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAIApi(new Configuration({ apiKey }));

// Route handler for the root endpoint
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello from yt summarizer' });
});

// Function to summarize a transcript using the OpenAI ChatGPT model
async function summarizeByChatgpt(transcript) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Summarize this "${transcript}" in a funny way for a second-grade student.`,
        temperature: 0.7,
        max_tokens: 864,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    });
    return response.data.choices[0].text.trim();
}


// Route handler for the POST request
router.post('/', async (req, res) => {
    const { url } = req.body;
    try {
        if (!validateAndExtractVideoId(url)) {
            res.status(404).json({ data: "Invalid url." });
            return;
        }

        // Fetch the transcript from YouTube
        const transcript = await YoutubeTranscript.fetchTranscript(url);
        let summarizedArticle = '';
        let segments = [];

        if (transcript.length <= 350) {
            // Summarize the entire transcript
            summarizedArticle = await summarizeByChatgpt(extractTextFromTranscript(transcript));
        } else {
            // Split the transcript into segments of 400 characters each
            for (let i = 0; i < transcript.length; i += 400) {
                const segment = transcript.slice(i, i + 400);
                segments.push(extractTextFromTranscript(segment));
            }

            // Summarize each segment asynchronously using Promise.all
            const summarizedArticles = await Promise.all(segments.map(summarizeByChatgpt));
            summarizedArticle = summarizedArticles.join('');
        }

        res.status(200).json({ data: summarizedArticle });
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({ error: error.message || 'Oops! Something went wrong' });
    }
});

export default router;
