"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Type, Trash, Download
} from 'lucide-react';
import pptxgen from 'pptxgenjs';
import { Image as ImageIcon } from 'lucide-react';

// PowerPoint dimensions (in inches)
const PPT_WIDTH = 10;
const PPT_HEIGHT = 5.625;
const DPI = 96;

// Conversion utilities
const inchesToPixels = (inches) => inches * DPI;
const pixelsToInches = (pixels) => pixels / DPI;

// Slide dimensions in pixels
const SLIDE_WIDTH = inchesToPixels(PPT_WIDTH);
const SLIDE_HEIGHT = inchesToPixels(PPT_HEIGHT);

// Corner positions in inches
const CORNERS = {
  topLeft: { x: 0, y: 0 },
  topRight: { x: PPT_WIDTH, y: 0 },
  bottomLeft: { x: 0, y: PPT_HEIGHT },
  bottomRight: { x: PPT_WIDTH, y: PPT_HEIGHT }
};

// Utility function for PowerPoint export
const convertColor = (cssColor) => {
  return cssColor.replace('#', '');
};

// Utility function to get scale factor
const getScaleFactor = (containerWidth) => {
  const targetWidth = inchesToPixels(PPT_WIDTH);
  return Math.min(1, (containerWidth - 48) / targetWidth);
};

// SlideContainer component
const SlideContainer = ({ children }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement.clientWidth - 48;
        setScale(getScaleFactor(parentWidth));
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
          border: '1px solid #ccc',
          boxSizing: 'content-box'
        }}
      >
        {children}
      </div>
    </div>
  );
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
  
    const position = {
      x: Math.round(pixelsToInches(element.position.x)),
      y: Math.round(pixelsToInches(element.position.y))
    };
  
    return (
      <div className="p-4 space-y-4">
        <div className="text-sm text-gray-600">
          <span>Position: ({position.x}in, {position.y}in)</span>
        </div>
  
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
  
        <div className="space-y-2">
          <label className="text-sm font-medium">Text Color</label>
          <input
            type="color"
            value={element.style.color}
            onChange={(e) => handleStyleChange('color', e.target.value)}
            className="w-full h-10"
          />
        </div>
  
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

// Text Element Component
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
  
    const getTextStyle = () => {
      const textPosition = {
        x: inchesToPixels(pixelsToInches(element.position.x)),
        y: inchesToPixels(pixelsToInches(element.position.y))
      };
  
      return {
        position: 'absolute',
        left: `${textPosition.x}px`,
        top: `${textPosition.y}px`,
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
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor: isSelected ? 'rgba(200, 200, 255, 0.1)' : 'transparent',
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
        userSelect: 'text',
        transformOrigin: 'top left'
      };
    };
  
    const handleMouseDown = (e) => {
      if (!elementRef.current.contains(e.target)) return;
      
      setIsDragging(true);
      const rect = elementRef.current.getBoundingClientRect();
      dragStartPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
  
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const parentRect = elementRef.current.parentElement.getBoundingClientRect();
      const scale = getScaleFactor(parentRect.width);
      
      const newX = (e.clientX - parentRect.left - dragStartPos.current.x) / scale;
      const newY = (e.clientY - parentRect.top - dragStartPos.current.y) / scale;
      
      const boundedX = Math.max(0, Math.min(SLIDE_WIDTH - 100, newX));
      const boundedY = Math.max(0, Math.min(SLIDE_HEIGHT - 50, newY));
      
      onPositionChange(id, { 
        x: pixelsToInches(boundedX) * DPI,
        y: pixelsToInches(boundedY) * DPI
      });
    };
  
    const handleMouseUp = () => {
      setIsDragging(false);
    };
  
    const handleInput = (e) => {
      e.preventDefault();
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const cursorPosition = range.startOffset;
      
      onUpdate(id, { 
        ...element, 
        text: e.target.innerText
      });
  
      requestAnimationFrame(() => {
        if (elementRef.current) {
          const textNode = elementRef.current.firstChild || elementRef.current;
          const newRange = document.createRange();
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
  
  // Image Element Component
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
  
    const getImageStyle = () => {
      const imagePosition = {
        x: inchesToPixels(pixelsToInches(element.position.x)),
        y: inchesToPixels(pixelsToInches(element.position.y))
      };
  
      const imageSize = {
        width: inchesToPixels(pixelsToInches(element.size.width)),
        height: inchesToPixels(pixelsToInches(element.size.height))
      };
  
      return {
        position: 'absolute',
        left: `${imagePosition.x}px`,
        top: `${imagePosition.y}px`,
        width: `${imageSize.width}px`,
        height: `${imageSize.height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        border: isSelected ? '2px solid #2196F3' : 'none',
        zIndex: isSelected ? 1000 : 1,
        transformOrigin: 'top left'
      };
    };
  
    const handleMouseDown = (e) => {
      if (!elementRef.current.contains(e.target)) return;
      
      const rect = elementRef.current.getBoundingClientRect();
      const isNearEdge = (coord, edge) => Math.abs(coord - edge) < 10;
      
      if (isNearEdge(e.clientX, rect.right) && isNearEdge(e.clientY, rect.bottom)) {
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
        const scale = getScaleFactor(rect.width);
        dragStartPos.current = {
          x: (e.clientX - rect.left) / scale,
          y: (e.clientY - rect.top) / scale
        };
      }
    };
  
    const handleMouseMove = (e) => {
      if (isResizing) {
        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;
        const scale = getScaleFactor(elementRef.current.parentElement.clientWidth);
        
        const newWidth = Math.max(50, initialSize.current.width + (deltaX / scale));
        const newHeight = Math.max(50, initialSize.current.height + (deltaY / scale));
        
        onUpdate(id, {
          ...element,
          size: {
            width: pixelsToInches(newWidth) * DPI,
            height: pixelsToInches(newHeight) * DPI
          }
        });
      } else if (isDragging) {
        const parentRect = elementRef.current.parentElement.getBoundingClientRect();
        const scale = getScaleFactor(parentRect.width);
        
        const newX = (e.clientX - parentRect.left - dragStartPos.current.x) / scale;
        const newY = (e.clientY - parentRect.top - dragStartPos.current.y) / scale;
        
        const boundedX = Math.max(0, Math.min(SLIDE_WIDTH - element.size.width, newX));
        const boundedY = Math.max(0, Math.min(SLIDE_HEIGHT - element.size.height, newY));
        
        onPositionChange(id, {
          x: pixelsToInches(boundedX) * DPI,
          y: pixelsToInches(boundedY) * DPI
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

// Export to PowerPoint function
const exportToPPTX = async (textElements, imageElements) => {
    try {
      const pres = new pptxgen();
      pres.defineLayout({ 
        name: 'CUSTOM_16_9',
        width: PPT_WIDTH,
        height: PPT_HEIGHT
      });
      pres.layout = 'CUSTOM_16_9';
  
      const slide = pres.addSlide();
  
      textElements.forEach(element => {
        const textOptions = {
          x: pixelsToInches(element.position.x),
          y: pixelsToInches(element.position.y),
          w: PPT_WIDTH - pixelsToInches(element.position.x),
          h: 'auto',
          fontSize: Math.round(pixelsToInches(element.style.fontSize) * 72), // Convert to points
          fontFace: element.style.fontFace,
          bold: element.style.bold,
          italic: element.style.italic,
          underline: element.style.underline ? { style: 'single' } : false,
          strike: element.style.strike,
          color: convertColor(element.style.color),
          align: element.style.align || 'left',
          valign: element.style.valign || 'top',
          margin: 0,
          wrap: true,
          charSpacing: element.style.letterSpacing ? 
            pixelsToInches(element.style.letterSpacing) * 100 : 0,
          lineSpacing: element.style.lineHeight || 1,
          transparency: element.style.transparency / 100
        };
  
        slide.addText(element.text, textOptions);
      });
  
      imageElements.forEach(element => {
        slide.addImage({
          data: element.src,
          x: pixelsToInches(element.position.x),
          y: pixelsToInches(element.position.y),
          w: pixelsToInches(element.size.width),
          h: pixelsToInches(element.size.height)
        });
      });
  
      await pres.writeFile({ fileName: 'presentation.pptx' });
      return true;
    } catch (error) {
      console.error('Error exporting to PowerPoint:', error);
      return false;
    }
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
            position: { x: pixelsToInches(80) * DPI, y: pixelsToInches(100) * DPI },
            size: { width: pixelsToInches(200) * DPI, height: pixelsToInches(200) * DPI },
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
        position: { x: pixelsToInches(80) * DPI, y: pixelsToInches(100) * DPI },
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
  
        <div className="flex-1 overflow-auto bg-gray-100">
          <SlideContainer>
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
          </SlideContainer>
        </div>
      </div>
    );
  };
  
  export default SlideEditor;