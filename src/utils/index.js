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

// Function to extract text from a transcript
export const extractTextFromTranscript = (transcript) => transcript.map(({ text }) => text).join(' ');