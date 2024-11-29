import React, { useState } from 'react';

function VideoCard({ video,title,videoId, onPlayVideo, wordTimeline, onDotClick, searchQuery }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedDotIndex, setExpandedDotIndex] = useState(null);

  // Play the video when clicked
  const playVideo = () => {
   
    onPlayVideo(video.videoId);
    setIsPlaying(true);
  };
  


  
  // Handle click on a dot to jump to specific time in the video
  const handleDotClick = (time) => {
    onDotClick(video.videoId, time); // Trigger seeking the video to the corresponding time
  };

  const highlightMatchedText = (text, searchQuery) => {
    if (!searchQuery) return text; // If no search query, return the full text

    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi')); // Split text at searchQuery, keeping the match
    return parts.map((part, idx) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <span key={idx} className="bg-yellow-300 font-semibold">{part}</span> // Highlight matched text
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-col mb-4 border border-gray-300 rounded-lg shadow-md">
      {/* Video Thumbnail */}
      <div className="relative w-full  h-40">
        <img
          src={`https://img.youtube.com/vi/${video.videoId}/0.jpg`}
          alt="Video Thumbnail"
          className="w-40 h-auto object-cover rounded-md cursor-pointer"
          onClick={playVideo}

        />
  <h3 className="mt-2  text-lg font-semibold">Title : {title}</h3>
 

      </div>

      {/* Timeline with Dots */}
      <div className="relative w-full h-16 mb-6 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="absolute top-1/4 min-w-[1200%] h-2 bg-red-300"></div>
        {wordTimeline.map((item, idx) => {
          const dotPosition = (item.time / 200) * 100; // Adjust scaling for dot placement

          return (
            <div
              key={idx}
              className="absolute flex flex-col items-center mt-2.5"
              style={{ left: `${dotPosition}%` }}
            >
              {/* Dot */}
              <div
                className="w-3 h-3 bg-red-500 rounded-full cursor-pointer"
                onClick={() => handleDotClick(item.time)}
              />
              {/* Matched Word */}
              <div className="mt-2 text-xs text-gray-600 text-center inline-block mb-5">
                <p className="font-semibold text-gray-800">
                  {/* Highlight matched word based on search query */}
                  {highlightMatchedText(item.text, searchQuery)}
                </p>
                {/* Time */}
                <p className="text-gray-500 mb-10">{`${item.time}s`}</p> {/* Darken the time and add some gap */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VideoCard;
