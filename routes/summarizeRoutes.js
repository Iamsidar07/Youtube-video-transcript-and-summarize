import express from 'express';
import { YoutubeTranscript } from "youtube-transcript";
import { OpenAIApi, Configuration } from 'openai';

const router = express.Router();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration);

router.route('/').get((req, res) => {
    res.status(200).json({ message: 'Hello from yt summarizer' });
});

// getting youtube video transcript from videoId
const getVideoTranscript = async (videoId, type) => {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    let transcriptStr = "";
    for (let index = 0; index < transcript.length; index++) {
        transcriptStr += `${transcript[index].text}. `;
    }
    return transcriptStr;
};

//summarize by chatgpt
const summarizeByChatgpt = async(transcript)=>{
   const response = await openai.createCompletion({
    model:"text-davinci-3.5",
    prompt:`Summarize this article: ${transcript}`,
    temperature:0.7,
    max_tokens:200,
    n:1,
   })
   return response.data.choices[0].text;
}


router.route('/').post(async (req, res) => {
    const { videoId } = req.body;
    const transcriptData = await getVideoTranscript(videoId);
    let summarizedArticle;
    if (transcriptData.length<=3000) {
        summarizedArticle = await summarizeByChatgpt(transcriptData); 
    }else{
        for (let i = 0; i < transcriptData.length; i+=3000) {
            let newSummarizeArticle = await summarizeByChatgpt(transcriptData.slice(i,3000));
            summarizedArticle+=newSummarizeArticle;
        }
    }
    res.status(200).json({ data: summarizedArticle });
});

export default router;