"use client"
import React, {  useRef } from 'react';
import { Card } from '../components/ui/card';

// PowerPoint dimensions (standard 16:9 presentation)
const SLIDE_WIDTH = 960;  // 10 inches * 96 DPI
const SLIDE_HEIGHT = 540; // 7.5 inches * 96 DPI

// Convert pixels to inches (PowerPoint uses inches)
const pxToInches = (px) => px / 96;
const inchesToPx = (inches) => inches * 96;

const SlideContainer = ({ children, onPositionUpdate }) => {
  const slideRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const slideRect = slideRef.current.getBoundingClientRect();
    
    // Calculate position relative to slide in inches
    const x = pxToInches(e.clientX - slideRect.left);
    const y = pxToInches(e.clientY - slideRect.top);
    
    onPositionUpdate({ x, y });
  };

  return (
    <div className="relative w-full overflow-auto p-8 bg-gray-100">
      <Card 
        ref={slideRef}
        className="relative bg-white mx-auto"
        style={{
          width: `${SLIDE_WIDTH}px`,
          height: `${SLIDE_HEIGHT}px`,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {children}
      </Card>
      {/* Ruler overlays could be added here */}
    </div>
  );
};

export default SlideContainer;