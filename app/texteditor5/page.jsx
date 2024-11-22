"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Toggle } from '../../components/ui/toggle';
import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Type, Trash, Download
} from 'lucide-react';
import pptxgen from 'pptxgenjs';
import { Image as ImageIcon } from 'lucide-react';

// PowerPoint dimensions (standard 16:9)
const SLIDE_WIDTH = 960;  // 10 inches * 96 DPI
const SLIDE_HEIGHT = 540; // 7.5 inches * 96 DPI

// Utility functions for PowerPoint export
const convertColor = (cssColor) => {
  return cssColor.replace('#', '');
};


const ImageElement = ({
  id,
  element,
  isSelected,
  onSelect,
  onUpdate,
  onPositionChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const elementRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialSize = useRef({ width: 0, height: 0 });

  const getImageStyle = () => ({
    position: 'absolute',
    left: `${element.position.x}px`,
    top: `${element.position.y}px`,
    width: `${element.size.width}px`,
    height: `${element.size.height}px`,
    cursor: isDragging ? 'grabbing' : 'grab',
    border: isSelected ? '2px solid #2196F3' : 'none',
    zIndex: isSelected ? 1000 : 1,
  });

  const handleMouseDown = (e) => {
    if (!elementRef.current.contains(e.target)) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    const isNearEdge = (coord, edge) => Math.abs(coord - edge) < 10;
    
    if (
      isNearEdge(e.clientX, rect.right) && 
      isNearEdge(e.clientY, rect.bottom)
    ) {
      setIsResizing(true);
      initialSize.current = {
        width: element.size.width,
        height: element.size.height
      };
      dragStartPos.current = {
        x: e.clientX,
        y: e.clientY
      };
    } else {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - element.position.x,
        y: e.clientY - element.position.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      
      const newWidth = Math.max(50, initialSize.current.width + deltaX);
      const newHeight = Math.max(50, initialSize.current.height + deltaY);
      
      onUpdate(id, {
        ...element,
        size: {
          width: newWidth,
          height: newHeight
        }
      });
    } else if (isDragging) {
      const newX = Math.max(0, Math.min(SLIDE_WIDTH - element.size.width, e.clientX - dragStartPos.current.x));
      const newY = Math.max(0, Math.min(SLIDE_HEIGHT - element.size.height, e.clientY - dragStartPos.current.y));
      
      onPositionChange(id, { x: newX, y: newY });
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
      style={getImageStyle()}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
    >
      <img 
        src={element.src} 
        alt={element.alt || 'Uploaded image'} 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            right: '-4px',
            bottom: '-4px',
            width: '8px',
            height: '8px',
            backgroundColor: '#2196F3',
            cursor: 'se-resize'
          }}
        />
      )}
    </div>
  );
};


const TextElement = ({
  id,
  element,
  isSelected,
  onSelect,
  onUpdate,
  onPositionChange
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
    verticalAlign: element.style.valign,
    cursor: 'text',
    backgroundColor: isSelected ? 'rgba(200, 200, 255, 0.1)' : 'transparent',
    minWidth: '100px',
    minHeight: '20px',
    padding: '4px',
    border: isSelected ? '1px solid #ddd' : '1px solid transparent',
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
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, Math.min(SLIDE_WIDTH - 100, e.clientX - dragStartPos.current.x));
    const newY = Math.max(0, Math.min(SLIDE_HEIGHT - 50, e.clientY - dragStartPos.current.y));
    
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
      onClick={() => onSelect(id)}
      contentEditable
      suppressContentEditableWarning={true}
      onInput={handleInput}
      dangerouslySetInnerHTML={{ __html: element.text }}
    />
  );
};
// PowerPoint export function
const exportToPPTX = async (textElements, imageElements) => {
    try {
      // Create a new presentation
      const pres = new pptxgen();
      
      // Set 16:9 layout (10 inches width is PowerPoint default)
      pres.defineLayout({ 
        name: 'CUSTOM_16_9',
        width: 10,
        height: 5.625
      });
      pres.layout = 'CUSTOM_16_9';
  
      // Add a new slide
      const slide = pres.addSlide();
  
      // Calculate scale factor (PowerPoint uses inches)
      // 960px = 10 inches, so 1 inch = 96px
      const scale = 96;
  
      // Add each text element to the slide
      textElements.forEach(element => {
        // Calculate dimensions
        // We need to provide width to prevent vertical text
        const width = 10 - (element.position.x / scale); // Remaining width from x position to slide end
  
        const textOptions = {
          x: element.position.x / scale,      // Convert px to inches
          y: element.position.y / scale,      // Convert px to inches
          w: Math.min(width, 8),             // Set a reasonable max width (8 inches)
          h: 'auto',                         // Auto height based on content
          fontSize: element.style.fontSize,   // PowerPoint uses points, which is same as CSS
          fontFace: element.style.fontFace,
          bold: element.style.bold,
          italic: element.style.italic,
          underline: element.style.underline ? { style: 'single' } : false,
          strike: element.style.strike,
          color: convertColor(element.style.color),
          align: element.style.align || 'left',
          valign: 'top',
          margin: 0,
          wrap: true,                        // Enable text wrapping
          //isTextBox: true,                   // Make it a text box
          //autoFit: false,                    // Prevent auto-fitting which can cause scaling issues
          //shrinkText: false,                 // Prevent text shrinking
          verticalAlign: 'top',              // Align text to top of box
          paraSpaceAfter: element.style.lineHeight ? 
            (element.style.lineHeight - 1) * 100 : 0, // Convert line height to percentage
          charSpacing: element.style.letterSpacing ? 
            element.style.letterSpacing * 100 : 0,    // Convert letter spacing to percentage
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
  
        // Add text to slide with fixed width to prevent vertical text
        slide.addText(textContent, textOptions);
      });

      imageElements.forEach(element => {
        slide.addImage({
          data: element.src,
          x: element.position.x / scale,
          y: element.position.y / scale,
          w: element.size.width / scale,
          h: element.size.height / scale
        });
      });
  
  
      // Save the presentation
      await pres.writeFile({ fileName: 'presentation.pptx' });
      return true;
    } catch (error) {
      console.error('Error exporting to PowerPoint:', error);
      return false;
    }
  };
  
  const TextProperties = ({ element, onUpdate }) => {
    if (!element) return null;
  
    const handleStyleChange = (property, value) => {
      onUpdate(element.id, {
        ...element,
        style: { ...element.style, [property]: value }
      });
    };
  
    const fontStyles = [
      { label: 'Arial', value: 'Arial' },
      { label: 'Times New Roman', value: 'Times New Roman' },
      { label: 'Calibri', value: 'Calibri' },
      { label: 'Helvetica', value: 'Helvetica' },
      { label: 'Georgia', value: 'Georgia' },
      { label: 'Verdana', value: 'Verdana' },
      { label: 'Courier New', value: 'Courier New' }
    ];
  
    const textTransformOptions = [
      { label: 'None', value: 'none' },
      { label: 'Uppercase', value: 'uppercase' },
      { label: 'Lowercase', value: 'lowercase' },
      { label: 'Capitalize', value: 'capitalize' }
    ];
  
    return (
      <div className="p-4 space-y-4">
        <div className="text-sm text-gray-600">
          <span>Position: ({Math.round(element.position.x)}px, {Math.round(element.position.y)}px)</span>
        </div>
  
        {/* Text Alignment */}
        <div className="flex space-x-2">
          <Button
            variant={element.style.align === 'left' ? 'default' : 'outline'}
            onClick={() => handleStyleChange('align', 'left')}
            className="p-2"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={element.style.align === 'center' ? 'default' : 'outline'}
            onClick={() => handleStyleChange('align', 'center')}
            className="p-2"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={element.style.align === 'right' ? 'default' : 'outline'}
            onClick={() => handleStyleChange('align', 'right')}
            className="p-2"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant={element.style.align === 'justify' ? 'default' : 'outline'}
            onClick={() => handleStyleChange('align', 'justify')}
            className="p-2"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>
  
        {/* Text Style Toggles */}
        <div className="flex flex-wrap gap-2">
          <Toggle
            pressed={element.style.bold}
            onPressedChange={(pressed) => handleStyleChange('bold', pressed)}
            className="data-[state=on]:bg-blue-500"
          >
            B
          </Toggle>
          <Toggle
            pressed={element.style.italic}
            onPressedChange={(pressed) => handleStyleChange('italic', pressed)}
            className="italic data-[state=on]:bg-blue-500"
          >
            I
          </Toggle>
          <Toggle
            pressed={element.style.underline}
            onPressedChange={(pressed) => handleStyleChange('underline', pressed)}
            className="underline data-[state=on]:bg-blue-500"
          >
            U
          </Toggle>
          <Toggle
            pressed={element.style.strike}
            onPressedChange={(pressed) => handleStyleChange('strike', pressed)}
            className="line-through data-[state=on]:bg-blue-500"
          >
            S
          </Toggle>
        </div>
        {/* Font Properties */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Font Family</label>
        <select
          value={element.style.fontFace}
          onChange={(e) => handleStyleChange('fontFace', e.target.value)}
          className="w-full p-2 border rounded"
        >
          {fontStyles.map(font => (
            <option key={font.value} value={font.value}>{font.label}</option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Font Size: {element.style.fontSize}px</label>
        <input
          type="range"
          min="8"
          max="144"
          value={element.style.fontSize}
          onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Letter Spacing */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Letter Spacing: {element.style.letterSpacing || 0}px</label>
        <input
          type="range"
          min="-5"
          max="20"
          value={element.style.letterSpacing || 0}
          onChange={(e) => handleStyleChange('letterSpacing', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Line Height */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Line Height: {element.style.lineHeight || 1}</label>
        <input
          type="range"
          min="10"
          max="30"
          value={(element.style.lineHeight || 1) * 10}
          onChange={(e) => handleStyleChange('lineHeight', e.target.value / 10)}
          className="w-full"
        />
      </div>

      {/* Text Transform */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Text Transform</label>
        <select
          value={element.style.textTransform || 'none'}
          onChange={(e) => handleStyleChange('textTransform', e.target.value)}
          className="w-full p-2 border rounded"
        >
          {textTransformOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Text Color</label>
        <input
          type="color"
          value={element.style.color}
          onChange={(e) => handleStyleChange('color', e.target.value)}
          className="w-full h-10"
        />
      </div>

      {/* Transparency */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Transparency: {element.style.transparency}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={element.style.transparency}
          onChange={(e) => handleStyleChange('transparency', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Text Shadow */}
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!element.style.textShadow}
            onChange={(e) => handleStyleChange('textShadow', e.target.checked ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none')}
          />
          <span className="text-sm font-medium">Text Shadow</span>
        </label>
      </div>
    </div>
  );
};

const SlideEditor = () => {
  const [textElements, setTextElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [imageElements, setImageElements] = useState([]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now(),
          type: 'image',
          src: e.target.result,
          position: { x: 80, y: 100 },
          size: { width: 200, height: 200 },
          alt: file.name
        };
        setImageElements([...imageElements, newImage]);
        setSelectedElement(newImage.id);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddText = () => {
    const newElement = {
      id: Date.now(),
      text: 'Click to type',
      position: { x: 80, y: 100 },
      style: {
        align: 'left',
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        color: '#000000',
        fontFace: 'Arial',
        fontSize: 16,
        transparency: 0,
        margin: 0,
        letterSpacing: 0,
        lineHeight: 1.2,
        textTransform: 'none',
        textShadow: 'none'
      }
    };

    setTextElements([...textElements, newElement]);
    setSelectedElement(newElement.id);
  };

  const handleElementUpdate = (id, updatedElement) => {
    setTextElements(elements =>
      elements.map(el => el.id === id ? updatedElement : el)
    );
  };

  const handlePositionChange = (id, newPosition) => {
    setTextElements(elements =>
      elements.map(el =>
        el.id === id ? { ...el, position: newPosition } : el
      )
    );
  };

  const handleDeleteSelected = () => {
    if (selectedElement) {
      setTextElements(elements => 
        elements.filter(el => el.id !== selectedElement)
      );
      setImageElements(elements => 
        elements.filter(el => el.id !== selectedElement)
      );
      setSelectedElement(null);
    }
  };

  const handleExport = async () => {
    const success = await exportToPPTX(textElements, imageElements);
    if (success) {
      alert('Presentation exported successfully!');
    } else {
      alert('Failed to export presentation. Please try again.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedElement) {
        handleDeleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-80 border-r overflow-y-auto bg-gray-50">
        <div className="p-4">
        <div className="flex gap-2 mb-4">
          <Button
            onClick={handleAddText}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Type className="h-4 w-4" />
            Add Text
          </Button>
          
          <label className="flex-1">
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={() => document.getElementById('image-upload').click()}
            >
              <ImageIcon className="h-4 w-4" />
              Add Image
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>
          
          {selectedElement && (
            <Button
              onClick={handleDeleteSelected}
              variant="destructive"
              className="flex items-center justify-center"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
          {/* Export Button */}
          <Button
            onClick={handleExport}
            className="w-full mb-4 flex items-center justify-center gap-2"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Export to PowerPoint
          </Button>

          <TextProperties
            element={textElements.find(el => el.id === selectedElement)}
            onUpdate={handleElementUpdate}
          />
        </div>
      </div>

      {/* Slide Area */}
      <div className="flex-1 overflow-auto p-8 bg-gray-100">
      <Card
  className="relative mx-auto bg-white"
  style={{
    width: `${SLIDE_WIDTH}px`,
    height: `${SLIDE_HEIGHT}px`,
  }}
  onClick={(e) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  }}
>
  {textElements.map((element) => (
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
  {imageElements.map((element) => (
    <ImageElement
      key={element.id}
      id={element.id}
      element={element}
      isSelected={selectedElement === element.id}
      onSelect={setSelectedElement}
      onUpdate={(id, updatedElement) => {
        setImageElements(elements =>
          elements.map(el => el.id === id ? updatedElement : el)
        );
      }}
      onPositionChange={(id, newPosition) => {
        setImageElements(elements =>
          elements.map(el =>
            el.id === id ? { ...el, position: newPosition } : el
          )
        );
      }}
    />
  ))}
</Card>
      </div>
    </div>
  );
};

export default SlideEditor;