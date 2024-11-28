// components/elements/TextElement.jsx
"use client"
import React, { useState, useRef, useEffect } from 'react';

export const TextElement = ({ 
  element, 
  isSelected, 
  onSelect, 
  onUpdate,
  onPositionChange 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const elementRef = useRef(null);

  const getTextStyle = () => ({
    position: 'absolute',
    left: element.position.x,
    top: element.position.y,
    width: element.position.width,
    height: element.position.height,
    fontFamily: element.style.fontFace,
    fontSize: `${element.style.fontSize}px`,
    fontWeight: element.style.bold ? 'bold' : 'normal',
    fontStyle: element.style.italic ? 'italic' : 'normal',
    textDecoration: [
      element.style.underline ? 'underline' : '',
      element.style.strike ? 'line-through' : ''
    ].filter(Boolean).join(' '),
    textAlign: element.style.align || 'left',
    color: element.style.color,
    lineHeight: element.style.lineHeight || '1.2',
    letterSpacing: `${element.style.letterSpacing || 0}px`,
    textTransform: element.style.textTransform || 'none',
    cursor: element.isTemplate ? 'text' : isDragging ? 'grabbing' : 'grab',
    padding: '4px',
    border: isSelected ? '1px solid #2196F3' : '1px solid transparent',
    background: isSelected ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
    userSelect: 'text',
    zIndex: isSelected ? 1000 : element.isTemplate ? 1 : 2,
    minWidth: element.isTemplate ? 'auto' : '100px',
    minHeight: element.isTemplate ? 'auto' : '24px',
    maxWidth: element.position.width || '100%',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    outline: 'none',
  });

  const handleMouseDown = (e) => {
    if (element.isTemplate) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    dragStart.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setIsDragging(true);
    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const containerRect = e.currentTarget.parentElement.getBoundingClientRect();
    const x = ((e.clientX - containerRect.left - dragStart.current.x) / containerRect.width) * 100;
    const y = ((e.clientY - containerRect.top - dragStart.current.y) / containerRect.height) * 100;

    onPositionChange(element.id, {
      x: `${Math.max(0, Math.min(100, x))}%`,
      y: `${Math.max(0, Math.min(100, y))}%`
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

// In TextElement.jsx, modify the handleInput function
const handleInput = (e) => {
    e.preventDefault();
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const cursorOffset = range.startOffset;
    
  
    onUpdate(element.id, {
      ...element,
      text: e.target.innerText
    });
  
    // More precise cursor restoration
    requestAnimationFrame(() => {
      if (elementRef.current) {
        const nodes = elementRef.current.childNodes;
        let currentNode = nodes[0];
        let remainingOffset = cursorOffset;
  
        // Find the correct text node and offset
        while (currentNode && remainingOffset > currentNode.length) {
          remainingOffset -= currentNode.length;
          currentNode = currentNode.nextSibling;
        }
  
        if (currentNode) {
          const newRange = document.createRange();
          newRange.setStart(currentNode, remainingOffset);
          newRange.setEnd(currentNode, remainingOffset);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Calculate container style based on element properties and state
  const getContainerStyle = () => ({
    position: 'absolute',
    left: element.position.x,
    top: element.position.y,
    width: element.position.width,
    height: element.position.height,
    fontFamily: element.style.fontFace,
    fontSize: `${element.style.fontSize}px`,
    fontWeight: element.style.bold ? 'bold' : 'normal',
    fontStyle: element.style.italic ? 'italic' : 'normal',
    textDecoration: [
      element.style.underline ? 'underline' : '',
      element.style.strike ? 'line-through' : ''
    ].filter(Boolean).join(' '),
    color: element.style.color,
    textAlign: element.style.align || 'left',
    verticalAlign: element.style.valign || 'top',
    cursor: element.isTemplate ? 'text' : isDragging ? 'grabbing' : 'grab',
    padding: '4px',
    border: isSelected ? '1px solid #2196F3' : '1px solid transparent',
    background: isSelected ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
    userSelect: 'text',
    zIndex: isSelected ? 1000 : element.isTemplate ? 1 : 2,
    minWidth: element.isTemplate ? 'auto' : '100px',
    minHeight: element.isTemplate ? 'auto' : '24px',
    maxWidth: element.position.width || '100%',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    outline: 'none',
  });

  return (
    <div
      ref={elementRef}
      style={getTextStyle()}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      contentEditable={!isDragging}
      suppressContentEditableWarning
      onInput={handleInput}
      dangerouslySetInnerHTML={{ __html: element.text }}
    />
  );
};

export default TextElement;