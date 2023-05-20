import express from 'express';
import { YoutubeTranscript } from "youtube-transcript";

const router = express.Router();

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
    if (type.toLowerCase() === "json") {
        return transcript;
    } else if (type.toLowerCase() === "text") {
        return transcriptStr;
    } else {
        return "Not a valid type";
    }
};


router.route('/').post(async (req, res) => {
    const { videoId, type } = req.body;
    const transcriptData = await getVideoTranscript(videoId, type);
    res.status(200).json({ data: transcriptData });
});

export default router;