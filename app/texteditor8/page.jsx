"use client"
import React, { useState, useEffect, useRef } from 'react';
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

// Font styles available in both browser and PowerPoint
const FONT_STYLES = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Georgia', value: 'Georgia' }
];

// Conversion utilities with safety checks
const inchesToPixels = (inches) => Math.floor(inches * DPI);
const pixelsToInches = (pixels) => Number((pixels / DPI).toFixed(3));
const pointsToPixels = (points) => Math.floor(points * DPI / 72);
const pixelsToPoints = (pixels) => Math.floor(pixels * 72 / DPI);

// Bounds checking utilities
const constrainPosition = (x, y, width, height) => ({
  x: Math.max(SAFE_ZONE_PX, Math.min(x, SLIDE_WIDTH - width - SAFE_ZONE_PX)),
  y: Math.max(SAFE_ZONE_PX, Math.min(y, SLIDE_HEIGHT - height - SAFE_ZONE_PX))
});

// SlideContainer component with proper scaling and boundaries
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

// SlideThumbnail component
const SlideThumbnail = ({ slide, isActive, onClick }) => {
  return (
    <div
      className={`w-full aspect-[16/9] bg-white border rounded-lg p-2 cursor-pointer mb-2
        ${isActive ? 'border-blue-500' : 'hover:border-gray-400'}`}
      onClick={onClick}
    >
      <div className="w-full h-full bg-gray-50 flex items-center justify-center text-sm text-gray-500">
        Slide {slide.id}
      </div>
    </div>
  );
};

// Sidebar Component with slide management
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


// Default text element style configuration
const DEFAULT_TEXT_STYLE = {
  fontFace: 'Arial',
  fontSize: pointsToPixels(18), // Start with 18pt font
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

// Text measurement utility
const measureText = (text, style) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `${style.italic ? 'italic ' : ''}${style.bold ? 'bold ' : ''}${style.fontSize}px ${style.fontFace}`;
  
  const metrics = context.measureText(text);
  const height = style.fontSize * style.lineHeight;
  return {
    width: Math.ceil(metrics.width),
    height: Math.ceil(height)
  };
};

// Text Element Component with improved positioning and styling
const TextElement = ({
  id,
  element,
  isSelected,
  onSelect,
  onUpdate,
  onPositionChange
}) => {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Text element style calculation
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
    letterSpacing: `${element.style.letterSpacing}px`,
    lineHeight: element.style.lineHeight,
    padding: '4px',
    margin: 0,
    background: isSelected ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
    border: isSelected ? '1px solid #2196F3' : '1px solid transparent',
    minWidth: '100px',
    maxWidth: `${SLIDE_WIDTH - (SAFE_ZONE_PX * 2) - element.position.x}px`,
    cursor: isDragging ? 'grabbing' : isEditing ? 'text' : 'move',
    userSelect: isEditing ? 'text' : 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    zIndex: isSelected ? 1000 : 1,
    boxSizing: 'border-box',
    outline: 'none'
  });

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    if (!elementRef.current.contains(e.target)) return;
    if (!isEditing) {
      setIsDragging(true);
      const rect = elementRef.current.getBoundingClientRect();
      dragStartPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      e.preventDefault();
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const parentRect = elementRef.current.parentElement.getBoundingClientRect();
    const scale = parentRect.width / SLIDE_WIDTH;
    
    const newX = (e.clientX - parentRect.left - dragStartPos.current.x) / scale;
    const newY = (e.clientY - parentRect.top - dragStartPos.current.y) / scale;
    
    const { x, y } = constrainPosition(
      newX,
      newY,
      elementRef.current.offsetWidth,
      elementRef.current.offsetHeight
    );
    
    onPositionChange(id, { x, y });
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Set up drag event listeners
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

  // Handle content changes
  const handleInput = () => {
    if (!elementRef.current) return;
    
    // Get current selection range
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    const cursorOffset = range?.startOffset || 0;
    
    // Update the text
    const newText = elementRef.current.textContent || '';
    onUpdate(id, {
      ...element,
      text: newText
    });
    
    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      if (elementRef.current) {
        const selection = window.getSelection();
        const range = document.createRange();
        const textNode = elementRef.current.firstChild || elementRef.current;
        
        try {
          range.setStart(textNode, cursorOffset);
          range.setEnd(textNode, cursorOffset);
          selection?.removeAllRanges();
          selection?.addRange(range);
        } catch (e) {
          console.warn('Could not restore cursor position');
        }
      }
    });
  };

  return (
    <div
      ref={elementRef}
      style={getTextStyle()}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
        if (!isEditing) {
          setIsEditing(true);
        }
      }}
      contentEditable={isEditing}
      suppressContentEditableWarning={true}
      onInput={handleInput}
      onBlur={() => setIsEditing(false)}
    >
      {element.text}
    </div>
  );
};

// Toolbar component for text styling
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
        >
          B
        </Toggle>
        <Toggle
          pressed={selectedElement.style.italic}
          onPressedChange={(pressed) => onStyleChange('italic', pressed)}
          className="h-9 w-9"
        >
          I
        </Toggle>
        <Toggle
          pressed={selectedElement.style.underline}
          onPressedChange={(pressed) => onStyleChange('underline', pressed)}
          className="h-9 w-9"
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
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStyleChange('align', 'center')}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStyleChange('align', 'right')}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
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

// Image Element Component
const ImageElement = ({
  id,
  element,
  isSelected,
  onSelect,
  onUpdate,
  onPositionChange
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

    const parentRect = elementRef.current.parentElement.getBoundingClientRect();
    const scale = parentRect.width / SLIDE_WIDTH;

    if (isResizing) {
      const deltaX = (e.clientX - dragStartPos.current.x) / scale;
      let newWidth = Math.max(
        DEFAULT_IMAGE_CONFIG.minWidth,
        Math.min(
          initialSize.current.width + deltaX,
          DEFAULT_IMAGE_CONFIG.maxWidth
        )
      );

      // Maintain aspect ratio
      let newHeight = newWidth / aspectRatio;
      
      // Check if height exceeds boundaries
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

// PowerPoint Export Function
const exportToPowerPoint = async (textElements, imageElements) => {
  try {
    const pres = new pptxgen();
    
    // Set 16:9 aspect ratio
    pres.defineLayout({ 
      name: 'CUSTOM_16_9',
      width: 10,
      height: 5.625
    });
    pres.layout = 'CUSTOM_16_9';

    const slide = pres.addSlide();

    // Export text elements
    textElements.forEach(element => {
      // Convert pixel positions to inches
      const x = pixelsToInches(element.position.x);
      const y = pixelsToInches(element.position.y);
      
      // Calculate maximum width based on position
      const maxWidth = 10 - x - pixelsToInches(SAFE_ZONE_PX);
      
      const textOptions = {
        x: x,
        y: y,
        w: maxWidth,
        //h: 25,
        //h: pixelsToInches(element.style.fontSize * element.style.lineHeight * 1.2),
        fontSize: Math.round(element.style.fontSize * 72 / 96), // Convert px to pt
        fontFace: element.style.fontFace,
        bold: element.style.bold,
        italic: element.style.italic,
        underline: element.style.underline ? { style: 'single' } : false,
        strike: element.style.strike,
        color: element.style.color.replace('#', ''),
        align: element.style.align || 'left',
        valign: element.style.valign || 'top',
        margin: 0,
        //wrap: true,
        breakLine: true ,
        charSpacing: element.style.letterSpacing / 10, // Convert to PowerPoint units
        lineSpacing: element.style.lineHeight,
        transparency: element.style.transparency / 100
      };

      slide.addText(element.text.replace(/\n/g, '\r\n'), textOptions);
    });

    // Export image elements
    imageElements.forEach(element => {
      const imageOptions = {
        data: element.src,
        x: pixelsToInches(element.position.x),
        y: pixelsToInches(element.position.y),
        w: pixelsToInches(element.size.width),
        h: pixelsToInches(element.size.height),
        sizing: {
          type: 'contain',
          w: pixelsToInches(element.size.width),
          h: pixelsToInches(element.size.height)
        }
      };

      slide.addImage(imageOptions);
    });

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
  const [slides, setSlides] = useState([{ id: 1, elements: [] }]);
  const [activeSlide, setActiveSlide] = useState(1);
  const [textElements, setTextElements] = useState([]);
  const [imageElements, setImageElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Save state to undo stack
  const saveState = () => {
    setUndoStack(prev => [...prev, { textElements, imageElements }]);
    setRedoStack([]);
  };

  // Handle undo/redo
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        if (e.shiftKey) {
          // Redo
          if (redoStack.length > 0) {
            const state = redoStack[redoStack.length - 1];
            setTextElements(state.textElements);
            setImageElements(state.imageElements);
            setRedoStack(prev => prev.slice(0, -1));
            setUndoStack(prev => [...prev, { textElements, imageElements }]);
          }
        } else {
          // Undo
          if (undoStack.length > 0) {
            const state = undoStack[undoStack.length - 1];
            setTextElements(state.textElements);
            setImageElements(state.imageElements);
            setUndoStack(prev => prev.slice(0, -1));
            setRedoStack(prev => [...prev, { textElements, imageElements }]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [undoStack, redoStack, textElements, imageElements]);

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

    setTextElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    saveState();
  };

  const handleAddImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      // Get image dimensions
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

        setImageElements(prev => [...prev, newElement]);
        setSelectedElement(newElement.id);
        saveState();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleStyleChange = (property, value) => {
    if (!selectedElement) return;

    setTextElements(elements =>
      elements.map(el =>
        el.id === selectedElement
          ? { ...el, style: { ...el.style, [property]: value } }
          : el
      )
    );
    saveState();
  };

  const handleElementUpdate = (id, updatedElement) => {
    if (updatedElement.type === 'text') {
      setTextElements(elements =>
        elements.map(el => el.id === id ? updatedElement : el)
      );
    } else {
      setImageElements(elements =>
        elements.map(el => el.id === id ? updatedElement : el)
      );
    }
    saveState();
  };

  const handlePositionChange = (id, newPosition) => {
    // Find element in either text or image elements
    const textElement = textElements.find(el => el.id === id);
    if (textElement) {
      setTextElements(elements =>
        elements.map(el =>
          el.id === id ? { ...el, position: newPosition } : el
        )
      );
    } else {
      setImageElements(elements =>
        elements.map(el =>
          el.id === id ? { ...el, position: newPosition } : el
        )
      );
    }
  };

  const handleDelete = () => {
    if (!selectedElement) return;

    setTextElements(elements =>
      elements.filter(el => el.id !== selectedElement)
    );
    setImageElements(elements =>
      elements.filter(el => el.id !== selectedElement)
    );
    setSelectedElement(null);
    saveState();
  };

  const handleExport = async () => {
    const success = await exportToPowerPoint(textElements, imageElements);
    if (success) {
      // Show success message
      alert('Presentation exported successfully!');
    } else {
      // Show error message
      alert('Failed to export presentation. Please try again.');
    }
  };

  // Clear selection when clicking on empty space
  const handleSlideClick = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
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
          onAddSlide={() => {
            const newSlide = {
              id: slides.length + 1,
              elements: []
            };
            setSlides([...slides, newSlide]);
            setActiveSlide(newSlide.id);
          }}
          onSelectSlide={setActiveSlide}
        />

        <div 
          className="flex-1 overflow-auto"
          onClick={handleSlideClick}
        >
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