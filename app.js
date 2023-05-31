import express from "express";
import Cors from "cors";
import youtubeVideoTranscript from "./src/routes/youtubeVideoTranscriptRoutes.js";
import youtubeVideoSummary from "./src/routes/youtubeVideoSummaryRoutes.js";

const app = express();

const port = process.env.port || 8080;

// Enable Cross-Origin Resource Sharing (CORS)
app.use(Cors());

// Parse JSON requests with a limit of 50mb
app.use(express.json({ limit: "50mb" }));

// Route middleware for handling /api/v1/transcript requests
app.use("/api/v1/transcript", youtubeVideoTranscript);

// Route middleware for handling /api/v1/summary requests
app.use("/api/v1/summary", youtubeVideoSummary);

// Function to start the server
const startServer = () => {
    try {
        // Route handler for the root endpoint
        app.get("/", async (req, res) => {
            res.send("Hello world from YoutubeVideoTranscript");
        });

        // Start the server and listen on the specified port
        app.listen(port, () => console.log(`Server is running on port ${port}`));
    } catch (error) {
        console.error(error);
    }
};

// Call the startServer function to start the server
startServer();
