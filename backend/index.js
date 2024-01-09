const express = require("express");
const { connectDB } = require("./database");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const hljs = require("highlight.js");

// Specify the allowed languages
const allowedLanguages = [
  "javascript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "ruby",
  "go",
  "swift",
  "php",
  "rust",
  "kotlin",
  "scala",
  "perl",
  "r",
  "matlab",
  "shell",
  "objectivec",
  "vbnet",
  "html",
  "yaml",
];

const app = express();
app.use(express.json()); // Parse JSON request bodies
app.use(cors());

let db;

async function main() {
  try {
    db = await connectDB();
    const collection = db.collection("pastes");
    const lastest = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    console.log("Last paste:");
    console.log(lastest);

    // clears the db for testing
    // collection.deleteMany({}, function(err, result) {
    //   if (err) {
    //     console.error('Error deleting documents:', err);
    //   } else {
    //     console.log('Deleted', result.deletedCount, 'documents from', collectionName);
    //   }
    // });

    return "Successfully connected to the database.";
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});
app.use("/api/", apiLimiter);

app.post("/api/paste-create", async (req, res) => {
  try {
    // Generate random 8-character share code
    const share_code = generateShareCode(8);

    // Get paste content from request body
    const content = req.body.content;

    const detectedLanguage = hljs.highlightAuto(
      content,
      allowedLanguages
    ).language;
    console.log(`detected language: ${detectedLanguage}`);

    // Create a new paste entry document
    const pasteEntry = {
      content,
      share_code,
      language: detectedLanguage,
      password: "",
      createdAt: new Date(),
    };

    // Insert the paste entry into the collection
    const collection = db.collection("pastes");
    await collection.insertOne(pasteEntry);

    res.status(201).json({ share_code });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/paste-fetch", async (req, res) => {
  try {
    // Get the share code from the request query parameters
    const share_code = req.query.share_code;

    // Retrieve the paste entry from the collection based on the share code
    const collection = db.collection("pastes");
    const pasteEntry = await collection.findOne({ share_code });

    if (!pasteEntry) {
      // If no paste entry is found, return a response indicating that the paste was not found
      return res.status(404).json({ error: "Paste not found" });
    }

    // If the paste entry is found, return the content
    res.status(200).json({ pasteEntry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Utility function to generate random share code
function generateShareCode(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let shareCode = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    shareCode += characters.charAt(randomIndex);
  }
  return shareCode;
}

const port = 3000;
app.listen(port, async () => {
  try {
    const result = await main();
    console.log(result);
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.error(error);
  }
});

app.get("/", (req, res) => {
  res.send("Express test");
});

// Route for viewing paste content based on share code
app.get("/:share_code", async (req, res) => {
  try {
    const share_code = req.params.share_code;

    // Retrieve the paste entry from the collection based on the share code
    const collection = db.collection("pastes");
    const pasteEntry = await collection.findOne({ share_code });

    if (!pasteEntry) {
      // If no paste entry is found, render an error page or display a message indicating that the paste was not found
      return res.status(404).send("Paste not found");
    }

    // If the paste entry is found, render the paste content view
    res.send(pasteEntry.content);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
