import express from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import { extractTextFromTranscript, validateAndExtractVideoId } from "./youtubeVideoSummaryRoutes.js";

const router = express.Router();

// Route handler for the root endpoint
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello from yt summarizer' });
});

// Function to fetch the video transcript from YouTube
const fetchVideoTranscript = async (url, type = "text") => {
    // Validate the YouTube video URL
    if (!validateAndExtractVideoId(url)) {
        return 'Invalid Url';
    }

    // Fetch the transcript JSON from YouTube
    const transcriptJSON = await YoutubeTranscript.fetchTranscript(url);

    // Extract the text from the transcript
    const transcriptText = extractTextFromTranscript(transcriptJSON);

    // Return the transcript based on the specified type
    return type.toLowerCase() === "json" ? transcriptJSON : transcriptText;
};

// Route handler for the POST request
router.post('/', async (req, res) => {
    const { url, type } = req.body;
    try {
        // Fetch the video transcript
        const transcriptData = await fetchVideoTranscript(url, type);

        // Send the transcript data as the response
        res.status(200).json({ data: transcriptData });
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({ error: error?.message || 'Oops🐕‍🦺, Something went wrong...' });
    }
});

export default router;
