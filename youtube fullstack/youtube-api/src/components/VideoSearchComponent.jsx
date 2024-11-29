import React, { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";

const YOUTUBE_API_KEY = "AIzaSyA3MIvZuc4Nb0NKM8SIc1poVpmoF66Umyg";

const VideoSearchComponent = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveToLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const getFromLocalStorage = (key) => {
    try {
      const storedData = localStorage.getItem(key);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  };

  const fetchSubtitles = async (videoId) => {
    try {
      const response = await fetch(`http://localhost:3000/subtitles?videoId=${videoId}`);
      if (!response.ok) throw new Error("Failed to fetch subtitles");

      const subtitleData = await response.json();
      saveToLocalStorage(`subtitle-${videoId}`, subtitleData.subtitle);
      console.log(`Subtitle saved for video ${videoId}`, subtitleData.subtitle);
    } catch (error) {
      console.error("Error fetching subtitles:", error);
    }
  };

  const handleSubtitleFetch = async (videoId) => {
    await fetchSubtitles(videoId);
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return "N/A";

    const hours = match[1] ? match[1].replace("H", "") : "0";
    const minutes = match[2] ? match[2].replace("M", "") : "0";
    const seconds = match[3] ? match[3].replace("S", "") : "0";

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const resolveChannelIdFromUrl = async (url) => {
    const usernameMatch = url.match(/@([a-zA-Z0-9_-]+)/);
    const customNameMatch = url.match(/\/c\/([a-zA-Z0-9_-]+)/);
    const channelIdMatch = url.match(/\/channel\/([a-zA-Z0-9_-]+)/);

    if (channelIdMatch) {
      return channelIdMatch[1];
    } else if (usernameMatch || customNameMatch) {
      const query = usernameMatch ? usernameMatch[1] : customNameMatch[1];
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=channel&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) return data.items[0].snippet.channelId;
      throw new Error("Channel not found");
    }

    throw new Error("Invalid channel URL format");
  };

  const extractVideoId = (url) => {
    const match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const fetchVideos = async () => {
    if (!selectedOption || !searchQuery) {
      setError("Please select an option and enter a search query.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let videosData = [];
      if (selectedOption === "option1") {
        let channelId = searchQuery;

        if (searchQuery.startsWith("http")) {
          try {
            channelId = await resolveChannelIdFromUrl(searchQuery);
          } catch (error) {
            setError("Failed to resolve channel URL. Please check the URL and try again.");
            setLoading(false);
            return;
          }
        }

        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&channelId=${channelId}&type=video&key=${YOUTUBE_API_KEY}`
        );
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const videoIds = data.items.map((item) => item.id.videoId);

          const detailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(
              ","
            )}&key=${YOUTUBE_API_KEY}`
          );
          const detailsData = await detailsResponse.json();

          videosData = detailsData.items.map((video) => ({
            videoId: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.high.url,
            duration: formatDuration(video.contentDetails?.duration),
            channelId: video.snippet.channelId,
            channelTitle: video.snippet.channelTitle,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            views: video.statistics?.viewCount || "N/A",
          }));
        } else {
          setError("No videos found for this channel.");
        }
      } else if (selectedOption === "option2") {
        const videoId = extractVideoId(searchQuery);
        if (!videoId) {
          setError("Invalid YouTube URL.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
        );
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const video = data.items[0];
          videosData = [
            {
              videoId: video.id,
              title: video.snippet.title,
              description: video.snippet.description,
              thumbnail: video.snippet.thumbnails.high.url,
              duration: formatDuration(video.contentDetails?.duration),
              channelId: video.snippet.channelId,
              channelTitle: video.snippet.channelTitle,
              views: formatViews( video.statistics?.viewCount || "N/A"),
              duration :formatDuration(video.formattedDuration),
              url: `https://www.youtube.com/watch?v=${video.id}`,

            },
          ];
        } else {
          setError("No video found for this URL.");
        }
      }

      setVideos(videosData);
      saveToLocalStorage("videos", videosData);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Error fetching videos. Please try again later.");
    }

    setLoading(false);
  };

  

  const formatViews = (views) => {
    if (!views) return "N/A";
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + "M";
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + "K";
    } else {
      return views;
    }
  };

  useEffect(() => {
    const savedVideos = getFromLocalStorage("videos");
    setVideos(savedVideos);
  }, []);

  const handleRemoveVideo = (videoId) => {
    const updatedVideos = videos.filter((video) => video.videoId !== videoId);
    setVideos(updatedVideos);
    saveToLocalStorage("videos", updatedVideos);
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setDropdownOpen(false);
  };
  

  return (
    <div className="container mx-auto p-4 max-w-6xl">
     

      
    <div className=" reletive flex justify-between items-center mb-16">
      <div>
        <button
          onClick={toggleDropdown}
          className="text-gray-700 bg-white focus:ring-1 focus:outline-none font-medium text-sm px-10 py-3.5 text-center inline-flex items-center shadow-lg"
        >
          {selectedOption ? (selectedOption === "option1" ? "Channel ID" : "Video URL") : "Select Option"}
          <svg
            className="w-2.5 h-2.5 ms-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>

        {dropdownOpen && (
          <div id="dropdownRadioBgHover" className="z-10 w-48 bg-green-50 shadow-lg mt-2 rounded-md  absolute">
            <ul className="p-1 text-sm text-gray-700 dark:text-gray-200 absolute">
              <li>
                <div className="flex items-center p-2">
                  
                  <input
                    id="default-radio-4"
                    type="radio"
                    value="option1"
                    name="default-radio"
                    onChange={() => handleOptionSelect("option1")}
                    checked={selectedOption === "option1"}
                    className="w-4 h-4 text-green-600 bg-transparent border-2 border-green-300 focus:ring-green-500 dark:focus:ring-green-600  dark:bg-gray-600 dark:border-gray-500"
                  />
                  <label
                    htmlFor="default-radio-4"
                    className="w-full ms-2 text-sm font-medium text-gray-900 dark:text-gray-700"
                  >
                    YouTube Channel
                  </label>
                </div>
              </li>
              <li>
                <div className="flex items-center p-2">
                  <input
                    id="default-radio-5"
                    type="radio"
                    value="option2"
                    name="default-radio"
                    onChange={() => handleOptionSelect("option2")}
                    checked={selectedOption === "option2"}
                    className="w-4 h-4 text-green-600 bg-transparent border-full border-green-600 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-green-600 dark:border-green-500"
                  />
                  <label
                    htmlFor="default-radio-5"
                    className="w-full ms-2 text-sm font-medium text-gray-900 dark:text-gray-700"
                  >
                    YouTube URL
                  </label>
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center w-full relative max-w-[800px]  bg-white border-t shadow-lg" >
<input
  type="text"
  placeholder={selectedOption ? (selectedOption === "option1" ? "Enter Channel ID" : "Enter Video URL") : "Enter Channel ID or Video URL"}
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="border border-gray-300 rounded-l px-3 py-2 w-full "
/>
<button
  onClick={fetchVideos}
  disabled={loading}
  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r flex items-center"
  style={{ width: "50px", justifyContent: "center" }}
>
  {loading ? "Wait..." : <Plus className="w-5 h-5" />}
</button>
</div>


    </div>

    {error && <p className="text-red-500 text-center mb-4">{error}</p>}

    <div  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-10">
      {videos.length > 0 ? (
        videos.map((video) => (
          <div key={video.videoId} className="bg-white rounded shadow-lg  relative pb-5">
            <img
               src={video.thumbnail}
               alt={video.title}
              className="w-full h-30 object-cover rounded-t-lg"
            />
            <div className="p-4">
            <h3 className="text-sm font-bold mb-2">Title : {video.title}</h3>
            <p className="text-gray-600 text-xs">Channel : {video.channelTitle}</p>
            <p className="text-gray-600 text-xs mb-4">View : {video.views} views</p>
            <p className="text-gray-600 text-xs mb-4">Duration : {video.duration}</p>

             
            </div>
            <button
    onClick={() => handleRemoveVideo(video.videoId || video.id)}
   
     
              className="absolute -top-2 -right-2 transition-opacity duration-300 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md z-10"
            >
              <Minus className="w-2 h-2" />
            </button>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500"></p>
        
      )}
    </div>
    
  </div>
);
};
export default VideoSearchComponent;
