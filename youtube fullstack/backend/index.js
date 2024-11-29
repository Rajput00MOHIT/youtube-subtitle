import express from 'express';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import cors from 'cors'; 
import he from 'he';
import striptags from 'striptags';




const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST'],         
  allowedHeaders: ['Content-Type'] 
}));

async function getSubtitles(videoID, translation) {
  console.log(`Starting getSubtitles function with videoID: ${videoID} and translation: ${translation}`);
  
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoID}`;
    console.log(`Fetching subtitles for: ${videoUrl}`);

    const response = await axios.get(videoUrl);
    const pageContent = response.data;
    console.log('Page content fetched successfully.');

    const captionsRegex = /"captionTracks":\[(.*?)\]/;
    const match = pageContent.match(captionsRegex);
    console.log('Trying to match caption tracks in the page content.');

    if (!match) {
   
      return { error: 'No captions available for this video.' };
    }


    const captionTracks = JSON.parse(`[${match[1]}]`);
    console.log("Available captions:", captionTracks);

    
    const selectedCaption = captionTracks.find(
      (track) =>
        translation
          ? track.languageCode === translation
          : track.languageCode === "en"
    );

    if (!selectedCaption) {
   
      return { error: `Subtitles not available in the requested language (${translation || 'en'})` };
    }

//    console.log("Found selected caption:", selectedCaption);

   
 //   console.log("Fetching subtitle content from:", selectedCaption.baseUrl);
  
const subtitleResponse  = await axios.get(selectedCaption.baseUrl);

const subtitles = subtitleResponse.data
.replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', "")
.replace("</transcript>", "")
.split("</text>")
.filter((line) => line && line.trim())
.map((line)=>{
  const startRegex = /start="([\d.]+)"/;
  const durRegex = /dur="([\d.]+)"/;

  const startMatch = startRegex.exec(line);
      const durMatch = durRegex.exec(line);

      if (!startMatch || !durMatch) {
        return null;
      }
      const [, start] = startMatch;
      const [, dur] = durMatch;

      const htmlText = line
        .replace(/<text.+>/, "")
        .replace(/&amp;/gi, "&")
        .replace(/<\/?[^>]+(>|$)/g, "");
      const decodedText = he.decode(htmlText);
      const text = striptags(decodedText);
      return { start, dur, text };
    })
    .filter((line) => line !== null);
    console.log(subtitles ,'subtitle get');
    return subtitles;
    


  } catch (error) {
    console.error("Error fetching subtitles:", error.message);
    return { error: error.message };
  }

  };

//console.log("Raw subtitle data:", subtitleResponse.data);  // Log raw subtitle data


const parser = new XMLParser();
//const subtitles = parser.parse(subtitleResponse.data);

//console.log("Parsed subtitle data:", subtitles);  // Log parsed data
     




  
  





// Route to fetch subtitles
app.get('/getSubtitles', async (req, res) => {
  console.log(`Received request for subtitles with query params: ${JSON.stringify(req.query)}`);
  const { videoID, translation = 'en' } = req.query;

  const subtitles = await getSubtitles(videoID, translation);
  console.log('Subtitles retrieved, sending response to client.');

  res.json(subtitles);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

