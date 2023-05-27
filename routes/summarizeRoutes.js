import express from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import { OpenAIApi, Configuration } from 'openai';
import * as dotenv from "dotenv";

dotenv.config();

const router = express.Router();


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration);

router.route('/').get((req, res) => {
    res.status(200).json({ message: 'Hello from yt summarizer' });
});

// getting youtube video transcript from videoId
const getVideoTranscript = async (videoId) => {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript;
};

// summarize by chatgpt
async function summarizeByChatgpt(transcript) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `This may related to previous article if any article you have summarized before. Summarize this article: ${transcript}`,
        temperature: 0.7,
        max_tokens: 200,
        n: 1,
    });
    return response.data.choices[0].text;
}

// extract text from transcript json
const extractTextFromTranscript = (transcript) => {
    let transcriptStr = '';
    for (let index = 0; index < transcript.length; index++) {
        transcriptStr += `${transcript[index].text} `;
    }
    return transcriptStr;
}

router.route('/').post(async (req, res) => {
    const { videoId } = req.body;
    const transcript = await getVideoTranscript(videoId);
    let summarizedArticle = '';
    let transcriptText = '';

    try {
        if (transcript.length <= 120) {
            transcriptText = extractTextFromTranscript(transcript);
            summarizedArticle = await summarizeByChatgpt(transcriptText);
        } else {
            for (let i = 0; i < transcript.length; i += 120) {
                transcriptText = extractTextFromTranscript(transcript.slice(i, i + 120));
                let newSummarizeArticle = await summarizeByChatgpt(transcriptText);
                summarizedArticle += newSummarizeArticle;
            }
        }
        res.status(200).json({ data: summarizedArticle });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Something went wrong' });
    }


});

export default router;