import React, { useRef, useEffect, useState } from 'react';
import './Timeline.css';

const Timeline = ({ duration = 60, currentTime = 0, onTimeChange }) => {
  const timelineRef = useRef(null);
  const [isMoving, setIsMoving] = useState(false);
  
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (e) => {
    setIsMoving(true);
    updateTimePosition(e);
  };

  const handleMouseMove = (e) => {
    if (isMoving) {
      updateTimePosition(e);
    }
  };

  const handleMouseUp = () => {
    setIsMoving(false);
  };

  const updateTimePosition = (e) => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const rect = timeline.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    const newTime = Math.max(0, Math.min(percentage * duration, duration));
    onTimeChange(newTime);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMoving]);

  return (
    <div className="timeline-container">
      <div className="timeline-ruler">
        {Array.from({ length: Math.ceil(duration / 10) + 1 }).map((_, index) => (
          <div key={index} className="timeline-mark">
            <div className="timeline-mark-label">{formatTime(index * 10)}</div>
          </div>
        ))}
      </div>
      <div 
        ref={timelineRef} 
        className="timeline" 
        onMouseDown={handleMouseDown}
      >
        <div 
          className="timeline-cursor" 
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default Timeline;
