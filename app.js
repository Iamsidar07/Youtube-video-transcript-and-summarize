import express from "express";
import Cors from "cors";
import ytVideoTranscript from "./routes/ytVideoTranscriptRoutes.js";
import ytVideoSummariz from './routes/summarizeRoutes.js'

const app = express();

const port = process.env.port || 8080;

app.use(Cors())
app.use(express.json({ limit: "50mb" }))

app.use("/api/v1/transcript", ytVideoTranscript);
app.use("/api/v1/summariz", ytVideoSummariz);

const startServer = () => {
    try {
        app.get("/", async (req, res) => {
            res.send("Hello world from YtVideoTranscript");
        })
        app.listen(port, () => console.log(`Server is running on port ${port}`));
    } catch (error) {
        console.error(error)
    }
}

startServer();

// Example usage:
// const videoId = '1Wq5itfNNnE';
