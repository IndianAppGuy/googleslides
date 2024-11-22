import React, { useState, useRef } from 'react';

const DraggableText = ({ 
  textProps, 
  position, 
  onPositionChange,
  onSelect 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const getTextStyle = () => ({
    position: 'absolute',
    left: `${position.x * 96}px`,  // Convert inches to pixels
    top: `${position.y * 96}px`,
    fontFamily: textProps.fontFace,
    fontSize: `${textProps.fontSize}px`,
    fontWeight: textProps.bold ? 'bold' : 'normal',
    fontStyle: textProps.italic ? 'italic' : 'normal',
    textDecoration: [
      textProps.underline ? 'underline' : '',
      textProps.strike ? 'line-through' : ''
    ].filter(Boolean).join(' '),
    textAlign: textProps.align,
    color: textProps.color,
    opacity: 1 - (textProps.transparency / 100),
    margin: `${textProps.margin}px`,
    verticalAlign: textProps.valign,
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    padding: '4px',
    border: '1px dashed transparent',
    ':hover': {
      border: '1px dashed #666'
    }
  });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - (position.x * 96),
      y: e.clientY - (position.y * 96)
    };
    onSelect();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = (e.clientX - dragStartPos.current.x) / 96;
    const newY = (e.clientY - dragStartPos.current.y) / 96;
    
    onPositionChange({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={elementRef}
      style={getTextStyle()}
      onMouseDown={handleMouseDown}
      className="absolute"
    >
      {textProps.text}
    </div>
  );
};

export default DraggableText;