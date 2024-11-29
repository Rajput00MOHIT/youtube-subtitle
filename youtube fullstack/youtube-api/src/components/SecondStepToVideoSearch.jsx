import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VideoCard from './videoCard';

function SubtitleFetcher() {
  const [language, setLanguage] = useState('en');
  const [subtitles, setSubtitles] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wordTimeline, setWordTimeline] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
 
  const [videoUrl, setVideoUrl] = useState(''); 
  const [showPopup, setShowPopup] = useState(false); 

  useEffect(() => {
    const storedVideos = localStorage.getItem('videos');
    if (storedVideos) {
      const videoArray = JSON.parse(storedVideos);
      if (videoArray.length > 0) {
        
        videoArray.forEach((video) => {
          fetchSubtitles(video.videoId);
        });
      }
    }
  }, []);

  const fetchSubtitles = async (videoId) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:3000/getSubtitles', {
        params: {
          videoID: videoId,
          translation: language,
        },
      });

      const fetchedSubtitles = response.data;

      if (fetchedSubtitles.error) {
        setError(fetchedSubtitles.error);
      } else {
    
        setSubtitles((prevSubtitles) => {
          const newSubtitles = { ...prevSubtitles, [videoId]: fetchedSubtitles };
          localStorage.setItem('subtitles', JSON.stringify(newSubtitles)); 
          return newSubtitles;
        });
      }
    } catch (err) {
      setError('Failed to fetch subtitles.');
    } finally {
      setLoading(false);
    }
  };

  const searchWordInSubtitles = () => {
    const foundTimes = [];
  
    
    Object.keys(subtitles).forEach((videoId) => {
      subtitles[videoId].forEach((item) => {
        if (item.text.toLowerCase().includes(searchQuery.toLowerCase())) {
          foundTimes.push({
            videoId: videoId,
            titleVideo: videoId, 
            time: item.start,
            text: item.text,
          });
        }
      });
    });
  
  
    const uniqueFoundTimes = foundTimes.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.videoId === value.videoId && t.time === value.time
      ))
    );
  
    setWordTimeline(uniqueFoundTimes);
    localStorage.setItem('wordTimeline', JSON.stringify(uniqueFoundTimes)); 
  };

  const playVideo = (videoId) => {
    setCurrentVideoId(videoId);
  };

  const handleDotClick = (videoId, time) => {
    const videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${Math.floor(time)}`;
    setVideoUrl(videoUrl); 
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false); 
    setVideoUrl(''); 
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center gap-4 w-full pl-60 pr-60">
        <input
          type="text"
          placeholder="Search subtitles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded w-full"
        />
        <button
          onClick={searchWordInSubtitles}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading subtitles...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="w-full max-w-4xl">
        {Object.keys(subtitles).length > 0 ? (
          Object.keys(subtitles).map((videoId) => (
            <VideoCard
              key={videoId}
              video={{ videoId }}
              onPlayVideo={playVideo}
              subtitles={subtitles[videoId]}
           
              wordTimeline={wordTimeline.filter((item) => item.videoId === videoId)}
              onDotClick={handleDotClick}
              searchQuery={searchQuery} 
            />
          ))
        ) : (
          <p>No subtitles available</p>
        )}
      </div>

 
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative w-96 h-54">
            <button
              onClick={closePopup}
              className="absolute bg-gray-800 text-white p-2 rounded-full"
            >
              X
            </button>
            <iframe
              width="500px"
              height="350px"
              src={videoUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube Video"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SubtitleFetcher;
