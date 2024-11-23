"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Toggle } from '../../components/ui/toggle';
import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Type, Trash, Download, Plus, Image as ImageIcon
} from 'lucide-react';
import pptxgen from 'pptxgenjs';

// PowerPoint dimensions and constants
const PPT_WIDTH = 10; // inches
const PPT_HEIGHT = 5.625; // inches (16:9 aspect ratio)
const DPI = 96; // Standard screen DPI
const SAFE_ZONE = 0.25; // 0.25 inch safe zone from edges

// Slide dimensions in pixels
const SLIDE_WIDTH = Math.floor(PPT_WIDTH * DPI);
const SLIDE_HEIGHT = Math.floor(PPT_HEIGHT * DPI);
const SAFE_ZONE_PX = Math.floor(SAFE_ZONE * DPI);

// Text constraints
const TEXT_CONSTRAINTS = {
  MIN_WIDTH: 100,
  MIN_HEIGHT: 24,
  PADDING: 8,
};

// Font styles available in both browser and PowerPoint
const FONT_STYLES = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Georgia', value: 'Georgia' }
];

// Default text element style configuration
const DEFAULT_TEXT_STYLE = {
  fontFace: 'Arial',
  fontSize: 24, // pixels
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  color: '#000000',
  align: 'left',
  valign: 'top',
  transparency: 0,
  letterSpacing: 0,
  lineHeight: 1.2,
  margin: 0
};

// Conversion utilities
const inchesToPixels = (inches) => Math.floor(inches * DPI);
const pixelsToInches = (pixels) => Number((pixels / DPI).toFixed(3));
const pointsToPixels = (points) => Math.floor(points * DPI / 72);
const pixelsToPoints = (pixels) => Math.floor(pixels * 72 / DPI);

// Text measurement utility
// Text measurement utility
const measureText = (text, style, maxWidth) => {
  // Create canvas for text measurement
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Set font properties
  const fontSize = `${style.fontSize}px`;
  const fontStyle = style.italic ? 'italic' : 'normal';
  const fontWeight = style.bold ? 'bold' : 'normal';
  const fontFamily = style.fontFace;

  context.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;

  // Calculate base width without wrapping
  const baseWidth = context.measureText(text).width + (text.length * style.letterSpacing);
  
  // If text fits within maxWidth, return single line dimensions
  if (baseWidth <= maxWidth) {
    return {
      width: Math.ceil(baseWidth),
      height: Math.ceil(style.fontSize * style.lineHeight),
      lines: 1
    };
  }

  // Handle text wrapping
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = context.measureText(testLine).width + (testLine.length * style.letterSpacing);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  // Calculate final dimensions
  const lineHeight = style.fontSize * style.lineHeight;
  const height = Math.ceil(lines.length * lineHeight);
  const width = Math.ceil(Math.min(
    maxWidth,
    Math.max(...lines.map(line => 
      context.measureText(line).width + (line.length * style.letterSpacing)
    ))
  ));

  return {
    width,
    height,
    lines: lines.length
  };
};

// Get available width based on position
const getAvailableWidth = (x) => {
  return Math.max(
    TEXT_CONSTRAINTS.MIN_WIDTH,
    SLIDE_WIDTH - SAFE_ZONE_PX * 2 - x
  );
};

// Calculate text element dimensions
const calculateTextDimensions = (element, availableWidth) => {
  const { text, style, position } = element;
  
  // Get maximum available width
  const maxWidth = getAvailableWidth(position.x) - (TEXT_CONSTRAINTS.PADDING * 2);
  
  // Measure text
  const { width, height } = measureText(text, style, maxWidth);
  
  // Return final dimensions with padding
  return {
    width: width + (TEXT_CONSTRAINTS.PADDING * 2),
    height: height + (TEXT_CONSTRAINTS.PADDING * 2)
  };
};

// Bounds checking utility
const constrainPosition = (x, y, width, height) => ({
  x: Math.max(SAFE_ZONE_PX, Math.min(x, SLIDE_WIDTH - width - SAFE_ZONE_PX)),
  y: Math.max(SAFE_ZONE_PX, Math.min(y, SLIDE_HEIGHT - height - SAFE_ZONE_PX))
});

// TextElement Component
const TextElement = ({
  id,
  element,
  isSelected,
  onSelect,
  onUpdate,
  onPositionChange,
  isPreview = false,
  scale = 1  // Add scale prop
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const elementRef = useRef(null);
    const dragStartPos = useRef({ x: 0, y: 0 });
  
    const getTextStyle = () => ({
      position: 'absolute',
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      fontFamily: element.style.fontFace,
      fontSize: `${element.style.fontSize}px`,
      fontWeight: element.style.bold ? 'bold' : 'normal',
      fontStyle: element.style.italic ? 'italic' : 'normal',
      textDecoration: [
        element.style.underline ? 'underline' : '',
        element.style.strike ? 'line-through' : ''
      ].filter(Boolean).join(' '),
      textAlign: element.style.align,
      color: element.style.color,
      opacity: 1 - (element.style.transparency / 100),
      margin: `${element.style.margin}px`,
      cursor: isDragging ? 'grabbing' : 'text',
      backgroundColor: isSelected ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
      minWidth: '100px',
      minHeight: '20px',
      padding: '4px',
      border: isSelected ? '1px solid #2196F3' : '1px solid transparent',
      outline: 'none',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      letterSpacing: `${element.style.letterSpacing || 0}px`,
      lineHeight: element.style.lineHeight || 'normal',
      textTransform: element.style.textTransform || 'none',
      textShadow: element.style.textShadow || 'none',
      zIndex: isSelected ? 1000 : 1,
      userSelect: 'text'
    });
  
    const handleMouseDown = (e) => {
      if (!elementRef.current.contains(e.target)) return;
      
      const rect = elementRef.current.getBoundingClientRect();
      const isClickNearBorder = 
        e.clientX - rect.left < 10 || 
        rect.right - e.clientX < 10 || 
        e.clientY - rect.top < 10 || 
        rect.bottom - e.clientY < 10;
  
      if (isClickNearBorder) {
        setIsDragging(true);
        dragStartPos.current = {
          x: e.clientX - element.position.x,
          y: e.clientY - element.position.y
        };
        e.preventDefault();
      }
    };
  
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      
      // Use provided scale for position calculations
      const newX = Math.max(
        SAFE_ZONE_PX, 
        Math.min(
          SLIDE_WIDTH - 100 - SAFE_ZONE_PX, 
          element.position.x + (deltaX / scale)
        )
      );
      
      const newY = Math.max(
        SAFE_ZONE_PX, 
        Math.min(
          SLIDE_HEIGHT - 50 - SAFE_ZONE_PX, 
          element.position.y + (deltaY / scale)
        )
      );
      
      onPositionChange(id, { x: newX, y: newY });
    };
  
    const handleMouseUp = () => {
      setIsDragging(false);
    };
  
    // Handle text input while preserving cursor position
    const handleInput = (e) => {
      e.preventDefault();
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const cursorPosition = range.startOffset;
      
      onUpdate(id, { 
        ...element, 
        text: e.target.innerText
      });
  
      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        if (elementRef.current) {
          const textNode = elementRef.current.firstChild || elementRef.current;
          const newRange = document.createRange();
          
          // Ensure cursor position doesn't exceed text length
          const newPosition = Math.min(cursorPosition, textNode.length);
          
          try {
            newRange.setStart(textNode, newPosition);
            newRange.setEnd(textNode, newPosition);
            
            selection.removeAllRanges();
            selection.addRange(newRange);
          } catch (err) {
            console.warn('Error setting cursor position:', err);
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
  
    return (
      <div
        ref={elementRef}
        style={getTextStyle()}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
        contentEditable
        suppressContentEditableWarning={true}
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: element.text }}
      />
    );
  };
  
  // TextToolbar Component
  const TextToolbar = ({ selectedElement, onStyleChange }) => {
    if (!selectedElement || selectedElement.type !== 'text') return null;
  
    return (
      <div className="flex items-center space-x-2 p-2">
        {/* Font Family */}
        <select
          value={selectedElement.style.fontFace}
          onChange={(e) => onStyleChange('fontFace', e.target.value)}
          className="h-9 border rounded px-2"
        >
          {FONT_STYLES.map(font => (
            <option key={font.value} value={font.value}>{font.label}</option>
          ))}
        </select>
  
        {/* Font Size */}
        <input
          type="number"
          value={pixelsToPoints(selectedElement.style.fontSize)}
          onChange={(e) => onStyleChange('fontSize', pointsToPixels(parseInt(e.target.value)))}
          className="w-16 h-9 border rounded px-2"
          min="1"
          max="200"
        />
  
        {/* Text Formatting */}
        <div className="flex border rounded">
          <Toggle
            pressed={selectedElement.style.bold}
            onPressedChange={(pressed) => onStyleChange('bold', pressed)}
            className="h-9 w-9"
            aria-label="Bold"
          >
            B
          </Toggle>
          <Toggle
            pressed={selectedElement.style.italic}
            onPressedChange={(pressed) => onStyleChange('italic', pressed)}
            className="h-9 w-9"
            aria-label="Italic"
          >
            I
          </Toggle>
          <Toggle
            pressed={selectedElement.style.underline}
            onPressedChange={(pressed) => onStyleChange('underline', pressed)}
            className="h-9 w-9"
            aria-label="Underline"
          >
            U
          </Toggle>
        </div>
  
        {/* Text Alignment */}
        <div className="flex border rounded">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStyleChange('align', 'left')}
            className={selectedElement.style.align === 'left' ? 'bg-gray-200' : ''}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStyleChange('align', 'center')}
            className={selectedElement.style.align === 'center' ? 'bg-gray-200' : ''}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStyleChange('align', 'right')}
            className={selectedElement.style.align === 'right' ? 'bg-gray-200' : ''}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStyleChange('align', 'justify')}
            className={selectedElement.style.align === 'justify' ? 'bg-gray-200' : ''}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>
  
        {/* Line Height Control */}
        <div className="flex items-center space-x-2 border rounded px-2">
          <span className="text-sm text-gray-500">Line</span>
          <input
            type="number"
            value={selectedElement.style.lineHeight}
            onChange={(e) => onStyleChange('lineHeight', parseFloat(e.target.value))}
            className="w-16 h-9 border rounded px-2"
            min="1"
            max="3"
            step="0.1"
          />
        </div>
  
        {/* Letter Spacing Control */}
        <div className="flex items-center space-x-2 border rounded px-2">
          <span className="text-sm text-gray-500">Spacing</span>
          <input
            type="number"
            value={selectedElement.style.letterSpacing}
            onChange={(e) => onStyleChange('letterSpacing', parseInt(e.target.value))}
            className="w-16 h-9 border rounded px-2"
            min="-2"
            max="20"
          />
        </div>
      </div>
    );
  };

  // Default image element configuration
const DEFAULT_IMAGE_CONFIG = {
    minWidth: 50,
    minHeight: 50,
    maxWidth: SLIDE_WIDTH - (SAFE_ZONE_PX * 2),
    maxHeight: SLIDE_HEIGHT - (SAFE_ZONE_PX * 2)
  };
  
  // ImageElement Component
  const ImageElement = ({
    id,
    element,
    isSelected,
    onSelect,
    onUpdate,
    onPositionChange,
    isPreview = false,
    scale = 1 
  }) => {
    const elementRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const initialSize = useRef({ width: 0, height: 0 });
    const elementPosition = useRef({ x: 0, y: 0 });
    const [aspectRatio, setAspectRatio] = useState(1);
  
    // Calculate and store aspect ratio on mount
    useEffect(() => {
      const img = new Image();
      img.onload = () => {
        setAspectRatio(img.width / img.height);
      };
      img.src = element.src;
    }, [element.src]);
  
    const getImageStyle = () => ({
      position: 'absolute',
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: `${element.size.width}px`,
      height: `${element.size.height}px`,
      cursor: isDragging ? 'grabbing' : isResizing ? 'nwse-resize' : 'grab',
      border: isSelected ? '2px solid #2196F3' : 'none',
      zIndex: isSelected ? 1000 : 1,
      boxSizing: 'border-box',
      userSelect: 'none'
    });
  
    const handleMouseDown = (e) => {
      if (!elementRef.current.contains(e.target)) return;
      
      const rect = elementRef.current.getBoundingClientRect();
      const isNearEdge = (coord, edge) => Math.abs(coord - edge) < 10;
      
      if (isSelected && isNearEdge(e.clientX, rect.right) && isNearEdge(e.clientY, rect.bottom)) {
        setIsResizing(true);
        initialSize.current = {
          width: element.size.width,
          height: element.size.height
        };
      } else {
        setIsDragging(true);
        elementPosition.current = {
          x: element.position.x,
          y: element.position.y
        };
      }
  
      dragStartPos.current = {
        x: e.clientX,
        y: e.clientY
      };
      e.preventDefault();
      e.stopPropagation();
    };
  
    const handleMouseMove = (e) => {
      if (!isDragging && !isResizing) return;
  
      if (isResizing) {
        const deltaX = (e.clientX - dragStartPos.current.x) / scale;
        let newWidth = Math.max(
          DEFAULT_IMAGE_CONFIG.minWidth,
          Math.min(
            initialSize.current.width + deltaX,
            DEFAULT_IMAGE_CONFIG.maxWidth
          )
        );
  
        let newHeight = newWidth / aspectRatio;
        
        if (newHeight > DEFAULT_IMAGE_CONFIG.maxHeight) {
          newHeight = DEFAULT_IMAGE_CONFIG.maxHeight;
          newWidth = newHeight * aspectRatio;
        }
  
        onUpdate(id, {
          ...element,
          size: {
            width: Math.round(newWidth),
            height: Math.round(newHeight)
          }
        });
      } else if (isDragging) {
        const deltaX = (e.clientX - dragStartPos.current.x) / scale;
        const deltaY = (e.clientY - dragStartPos.current.y) / scale;
        
        const newPosition = constrainPosition(
          elementPosition.current.x + deltaX,
          elementPosition.current.y + deltaY,
          element.size.width,
          element.size.height
        );
  
        onPositionChange(id, newPosition);
      }
    };
  
    const handleMouseUp = () => {
      if (isDragging) {
        elementPosition.current = element.position;
      }
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
        style={getImageStyle()}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
      >
        <img
          src={element.src}
          alt={element.alt || 'Slide image'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
            WebkitUserDrag: 'none'
          }}
        />
        {isSelected && (
          <div
            className="absolute right-0 bottom-0 w-3 h-3 bg-blue-500 cursor-se-resize"
            style={{ transform: 'translate(50%, 50%)' }}
          />
        )}
      </div>
    );
  };
  
  // SlideContainer component
  const SlideContainer = ({ children }) => {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
  
    useEffect(() => {
      const updateScale = () => {
        if (containerRef.current) {
          const parent = containerRef.current.parentElement;
          const parentWidth = parent.clientWidth - 48; // 48px for padding
          const parentHeight = parent.clientHeight - 48;
          const scaleX = parentWidth / SLIDE_WIDTH;
          const scaleY = parentHeight / SLIDE_HEIGHT;
          setScale(Math.min(scaleX, scaleY, 1));
        }
      };
  
      updateScale();
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }, []);
  
    return (
      <div className="flex justify-center items-center h-full p-6">
        <div
          ref={containerRef}
          className="relative bg-white shadow-lg"
          style={{
            width: `${SLIDE_WIDTH}px`,
            height: `${SLIDE_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            border: '1px solid #ccc'
          }}
        >
          {/* Safe zone indicator */}
          <div
            className="absolute pointer-events-none border border-dashed border-gray-300 opacity-50"
            style={{
              top: SAFE_ZONE_PX,
              left: SAFE_ZONE_PX,
              right: SAFE_ZONE_PX,
              bottom: SAFE_ZONE_PX
            }}
          />
          {children}
        </div>
      </div>
    );
  };
  
// SlideThumbnail component with preview
const SlideThumbnail = ({ slide, isActive, onClick }) => {
  // Calculate scale based on a fixed thumbnail width
  const THUMBNAIL_WIDTH = 220;
  const scale = THUMBNAIL_WIDTH / SLIDE_WIDTH;
  
  return (
    <div
      className={`relative cursor-pointer mb-2 rounded-lg overflow-hidden ${
        isActive ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-400'
      }`}
      onClick={onClick}
      style={{
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_WIDTH * (SLIDE_HEIGHT / SLIDE_WIDTH),
      }}
    >
      {/* Outer container for centering */}
      <div className="absolute inset-0 bg-white">
        {/* Scaling container */}
        <div 
          className="origin-center"
          style={{
            position: 'absolute',
            width: SLIDE_WIDTH,
            height: SLIDE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* Safe zone indicator - scaled automatically */}
          <div
            className="absolute border border-dashed border-gray-300 opacity-50 pointer-events-none"
            style={{
              top: SAFE_ZONE_PX,
              left: SAFE_ZONE_PX,
              right: SAFE_ZONE_PX,
              bottom: SAFE_ZONE_PX,
            }}
          />

          {/* Text Elements */}
          {slide.textElements.map(element => (
            <div
              key={element.id}
              style={{
                position: 'absolute',
                left: element.position.x,
                top: element.position.y,
                fontFamily: element.style.fontFace,
                fontSize: `${element.style.fontSize}px`,
                fontWeight: element.style.bold ? 'bold' : 'normal',
                fontStyle: element.style.italic ? 'italic' : 'normal',
                textDecoration: [
                  element.style.underline ? 'underline' : '',
                  element.style.strike ? 'line-through' : ''
                ].filter(Boolean).join(' '),
                textAlign: element.style.align,
                color: element.style.color,
                opacity: 1 - (element.style.transparency / 100),
                whiteSpace: 'pre-wrap', // Changed: Preserve line breaks
                overflow: 'hidden',
                width: Math.min(       // Added: Constrain width
                  element.style.width || SLIDE_WIDTH - element.position.x - SAFE_ZONE_PX * 2,
                  SLIDE_WIDTH - element.position.x - SAFE_ZONE_PX * 2
                ),
                lineHeight: element.style.lineHeight || 1.2,
                letterSpacing: `${element.style.letterSpacing || 0}px`,
                padding: TEXT_CONSTRAINTS.PADDING,
                maxHeight: SLIDE_HEIGHT - element.position.y - SAFE_ZONE_PX * 2, // Added: Constrain height
              }}
            >
              {element.text}
            </div>
          ))}

          {/* Image Elements */}
          {slide.imageElements.map(element => (
            <div
              key={element.id}
              style={{
                position: 'absolute',
                left: element.position.x,
                top: element.position.y,
                width: element.size.width,
                height: element.size.height,
                overflow: 'hidden',
              }}
            >
              <img
                src={element.src}
                alt={element.alt || 'Slide image'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

  // Sidebar Component
  const Sidebar = ({ slides, activeSlide, onAddSlide, onSelectSlide }) => {
    return (
      <div className="w-64 bg-gray-50 border-r overflow-y-auto p-4">
        <Button
          onClick={onAddSlide}
          className="w-full mb-4 flex items-center justify-center gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New Slide
        </Button>
  
        <div className="space-y-2">
          {slides.map((slide) => (
            <SlideThumbnail
              key={slide.id}
              slide={slide}
              isActive={activeSlide === slide.id}
              onClick={() => onSelectSlide(slide.id)}
            />
          ))}
        </div>
      </div>
    );
  };

// PowerPoint Export Function
const convertColor = (cssColor) => {
    return cssColor.replace('#', '');
  };
  
  const exportToPowerPoint = async (slides) => {
    try {
      const pres = new pptxgen();
      
      // Set 16:9 layout
      pres.defineLayout({ 
        name: 'CUSTOM_16_9',
        width: PPT_WIDTH,
        height: PPT_HEIGHT
      });
      pres.layout = 'CUSTOM_16_9';
  
      // Export each slide
      for (const slide of slides) {
        const pptSlide = pres.addSlide();
        
        // Add text elements
        slide.textElements.forEach(element => {
          const textOptions = {
            x: pixelsToInches(element.position.x),
            y: pixelsToInches(element.position.y),
            w: pixelsToInches(SLIDE_WIDTH - element.position.x - SAFE_ZONE_PX),
            h: 'auto',
            fontSize: pixelsToPoints(element.style.fontSize),
            fontFace: element.style.fontFace,
            bold: element.style.bold,
            italic: element.style.italic,
            underline: element.style.underline ? { style: 'single' } : false,
            strike: element.style.strike,
            color: element.style.color.replace('#', ''),
            align: element.style.align || 'left',
            valign: 'top',
            margin: 0,
            wrap: true,
            verticalAlign: 'top',
            paraSpaceAfter: element.style.lineHeight ? 
              (element.style.lineHeight - 1) * 100 : 0,
            charSpacing: element.style.letterSpacing ? 
              element.style.letterSpacing * 100 : 0
          };
  
          // Handle text transform
          let textContent = element.text;
          if (element.style.textTransform) {
            switch(element.style.textTransform) {
              case 'uppercase':
                textContent = textContent.toUpperCase();
                break;
              case 'lowercase':
                textContent = textContent.toLowerCase();
                break;
              case 'capitalize':
                textContent = textContent.replace(/\b\w/g, l => l.toUpperCase());
                break;
            }
          }
  
          pptSlide.addText(textContent, textOptions);
        });
  
        // Add image elements
        slide.imageElements.forEach(element => {
          pptSlide.addImage({
            data: element.src,
            x: pixelsToInches(element.position.x),
            y: pixelsToInches(element.position.y),
            w: pixelsToInches(element.size.width),
            h: pixelsToInches(element.size.height)
          });
        });
      }
  
      await pres.writeFile({ fileName: 'presentation.pptx' });
      return true;
    } catch (error) {
      console.error('Error exporting to PowerPoint:', error);
      return false;
    }
  };
  // Main Toolbar Component
  const Toolbar = ({ 
    selectedElement, 
    onStyleChange, 
    onAddText, 
    onAddImage,
    onExport,
    onDelete 
  }) => {
    return (
      <div className="border-b bg-white p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Creation Tools */}
          <div className="flex items-center space-x-2 border-r pr-2">
            <Button variant="outline" size="sm" onClick={onAddText}>
              <Type className="h-4 w-4 mr-2" />
              Add Text
            </Button>
            <label>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('image-upload').click()}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Add Image
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={onAddImage}
                className="hidden"
              />
            </label>
          </div>
  
          {/* Text Styling Tools */}
          {selectedElement && selectedElement.type === 'text' && (
            <TextToolbar
              selectedElement={selectedElement}
              onStyleChange={onStyleChange}
            />
          )}
        </div>
  
        <div className="flex items-center space-x-2">
          {/* Delete Button */}
          {selectedElement && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-red-500 hover:bg-red-50"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
  
          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="bg-blue-50 hover:bg-blue-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to PPT
          </Button>
        </div>
      </div>
    );
  };
  
// Main SlideEditor Component
const SlideEditor = () => {
    // State Management
    const [slides, setSlides] = useState([{
      id: 1,
      textElements: [],
      imageElements: []
    }]);
    const [activeSlide, setActiveSlide] = useState(1);
    const [selectedElement, setSelectedElement] = useState(null);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
  
    // Get current slide's elements
    const currentSlide = slides.find(slide => slide.id === activeSlide) || slides[0];
    const textElements = currentSlide.textElements;
    const imageElements = currentSlide.imageElements;
  
    // Save state to undo stack
    const saveState = () => {
      setUndoStack(prev => [...prev, slides]);
      setRedoStack([]);
    };
  
    // Handle undo/redo
    useEffect(() => {
      const handleKeyboard = (e) => {
        if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
          if (e.shiftKey) {
            // Redo
            if (redoStack.length > 0) {
              const newSlides = redoStack[redoStack.length - 1];
              setSlides(newSlides);
              setRedoStack(prev => prev.slice(0, -1));
              setUndoStack(prev => [...prev, slides]);
            }
          } else {
            // Undo
            if (undoStack.length > 0) {
              const newSlides = undoStack[undoStack.length - 1];
              setSlides(newSlides);
              setUndoStack(prev => prev.slice(0, -1));
              setRedoStack(prev => [...prev, slides]);
            }
          }
        }
      };
  
      window.addEventListener('keydown', handleKeyboard);
      return () => window.removeEventListener('keydown', handleKeyboard);
    }, [undoStack, redoStack, slides]);
  
    // Handle element updates
    const updateSlideElements = (slideId, newTextElements, newImageElements) => {
      setSlides(prevSlides =>
        prevSlides.map(slide =>
          slide.id === slideId
            ? { ...slide, textElements: newTextElements, imageElements: newImageElements }
            : slide
        )
      );
    };
  
    // Element Management Functions
    const handleAddText = () => {
      const newElement = {
        id: Date.now(),
        type: 'text',
        text: 'Click to edit',
        position: {
          x: SAFE_ZONE_PX + 20,
          y: SAFE_ZONE_PX + 20
        },
        style: { ...DEFAULT_TEXT_STYLE }
      };
  
      updateSlideElements(
        activeSlide,
        [...textElements, newElement],
        imageElements
      );
      setSelectedElement(newElement.id);
      saveState();
    };
  
    const handleAddImage = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          let width = Math.min(DEFAULT_IMAGE_CONFIG.maxWidth / 2, img.width);
          let height = width / aspectRatio;
  
          if (height > DEFAULT_IMAGE_CONFIG.maxHeight) {
            height = DEFAULT_IMAGE_CONFIG.maxHeight;
            width = height * aspectRatio;
          }
  
          const newElement = {
            id: Date.now(),
            type: 'image',
            src: e.target.result,
            position: {
              x: SAFE_ZONE_PX + 20,
              y: SAFE_ZONE_PX + 20
            },
            size: {
              width: Math.round(width),
              height: Math.round(height)
            },
            alt: file.name
          };
  
          updateSlideElements(
            activeSlide,
            textElements,
            [...imageElements, newElement]
          );
          setSelectedElement(newElement.id);
          saveState();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    };
  
    const handleStyleChange = (property, value) => {
      if (!selectedElement) return;
  
      const updatedElements = textElements.map(el =>
        el.id === selectedElement
          ? { ...el, style: { ...el.style, [property]: value } }
          : el
      );
  
      updateSlideElements(activeSlide, updatedElements, imageElements);
      saveState();
    };
  
    const handleElementUpdate = (id, updatedElement) => {
      if (updatedElement.type === 'text') {
        const updatedElements = textElements.map(el =>
          el.id === id ? updatedElement : el
        );
        updateSlideElements(activeSlide, updatedElements, imageElements);
      } else {
        const updatedElements = imageElements.map(el =>
          el.id === id ? updatedElement : el
        );
        updateSlideElements(activeSlide, textElements, updatedElements);
      }
      saveState();
    };
  
    const handlePositionChange = (id, newPosition) => {
      const textElement = textElements.find(el => el.id === id);
      if (textElement) {
        const updatedElements = textElements.map(el =>
          el.id === id ? { ...el, position: newPosition } : el
        );
        updateSlideElements(activeSlide, updatedElements, imageElements);
      } else {
        const updatedElements = imageElements.map(el =>
          el.id === id ? { ...el, position: newPosition } : el
        );
        updateSlideElements(activeSlide, textElements, updatedElements);
      }
    };
  
    const handleDelete = () => {
      if (!selectedElement) return;
  
      const updatedTextElements = textElements.filter(el => el.id !== selectedElement);
      const updatedImageElements = imageElements.filter(el => el.id !== selectedElement);
      
      updateSlideElements(
        activeSlide,
        updatedTextElements,
        updatedImageElements
      );
      setSelectedElement(null);
      saveState();
    };
  
    const handleAddSlide = () => {
      const newSlide = {
        id: slides.length + 1,
        textElements: [],
        imageElements: []
      };
      setSlides([...slides, newSlide]);
      setActiveSlide(newSlide.id);
      setSelectedElement(null);
    };
  
    

    const handleExport = async () => {
      const success = await exportToPowerPoint(slides);
      if (success) {
        alert('Presentation exported successfully!');
      } else {
        alert('Failed to export presentation. Please try again.');
      }
    };
  
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Toolbar
          selectedElement={
            textElements.find(el => el.id === selectedElement) ||
            imageElements.find(el => el.id === selectedElement)
          }
          onStyleChange={handleStyleChange}
          onAddText={handleAddText}
          onAddImage={handleAddImage}
          onExport={handleExport}
          onDelete={handleDelete}
        />
  
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            slides={slides}
            activeSlide={activeSlide}
            onAddSlide={handleAddSlide}
            onSelectSlide={(id) => {
              setActiveSlide(id);
              setSelectedElement(null);
            }}
          />

          <div className="flex-1 overflow-auto" onClick={() => setSelectedElement(null)}>
            <SlideContainer>
              {textElements.map(element => (
                <TextElement
                  key={element.id}
                  id={element.id}
                  element={element}
                  isSelected={selectedElement === element.id}
                  onSelect={setSelectedElement}
                  onUpdate={handleElementUpdate}
                  onPositionChange={handlePositionChange}
                />
              ))}
              {imageElements.map(element => (
                <ImageElement
                  key={element.id}
                  id={element.id}
                  element={element}
                  isSelected={selectedElement === element.id}
                  onSelect={setSelectedElement}
                  onUpdate={handleElementUpdate}
                  onPositionChange={handlePositionChange}
                />
              ))}
            </SlideContainer>
          </div>
        </div>
      </div>
    );
  };
  
  export default SlideEditor;