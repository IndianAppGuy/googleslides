// components/elements/ImageElement.jsx
"use client"
import React, { useState, useRef, useEffect } from 'react';

const ImageElement = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onPositionChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const elementRef = useRef(null);
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setAspectRatio(img.width / img.height);
    };
    img.src = element.src;
  }, [element.src]);

  const handleMouseDown = (e) => {
    if (element.isTemplate) return;

    const rect = elementRef.current.getBoundingClientRect();
    const isNearEdge = (coord, edge) => Math.abs(coord - edge) < 10;
    
    if (isSelected && isNearEdge(e.clientX, rect.right) && isNearEdge(e.clientY, rect.bottom)) {
      setIsResizing(true);
    } else {
      setIsDragging(true);
    }

    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: parseFloat(element.size.width),
      height: parseFloat(element.size.height),
      left: parseFloat(element.position.x),
      top: parseFloat(element.position.y)
    };

    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    if (!isDragging && !isResizing) return;

    const containerRect = elementRef.current.parentElement.getBoundingClientRect();
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    if (isResizing) {
      const newWidth = Math.max(50, (dragStart.current.width + (deltaX / containerRect.width) * 100));
      const newHeight = newWidth / aspectRatio;

      onUpdate(element.id, {
        ...element,
        size: {
          width: `${Math.min(newWidth, 90)}%`,
          height: `${Math.min(newHeight, 90)}%`
        }
      });
    } else if (isDragging) {
      const x = dragStart.current.left + (deltaX / containerRect.width) * 100;
      const y = dragStart.current.top + (deltaY / containerRect.height) * 100;

      onPositionChange(element.id, {
        x: `${Math.max(0, Math.min(100 - parseFloat(element.size.width), x))}%`,
        y: `${Math.max(0, Math.min(100 - parseFloat(element.size.height), y))}%`
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        cursor: element.isTemplate ? 'default' : 
                isResizing ? 'nwse-resize' : 
                isDragging ? 'grabbing' : 'grab',
        zIndex: isSelected ? 1000 : element.isTemplate ? 1 : 2
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
      onMouseDown={handleMouseDown}
    >
      <img
        src={element.src}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none'
        }}
      />
      
      {isSelected && !element.isTemplate && (
        <>
          <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
          <div 
            className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
            style={{ transform: 'translate(50%, 50%)' }}
          />
        </>
      )}
    </div>
  );
};

export default ImageElement;