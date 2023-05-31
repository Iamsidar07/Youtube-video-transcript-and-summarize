import express from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import { OpenAIApi, Configuration } from 'openai';
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

// Function to extract text from a transcript
export const extractTextFromTranscript = (transcript) => transcript.map(({ text }) => text).join(' ');

// Function to validate and extract the video ID from a YouTube URL
export const validateAndExtractVideoId = (url) => {
    // Extract video ID from the URL
    const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube(?:\.com|-\w{2,3}\.\w{2})\/(?:watch(?:\/|.*v=)|embed\/|v\/|shorts\/)?([^#\&\?]*).*/i);
    if (videoIdMatch && videoIdMatch[1]) {
        const videoId = videoIdMatch[1];
        return videoId;
    } else {
        return null; // URL is not a valid YouTube URL or video ID could not be extracted
    }
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
