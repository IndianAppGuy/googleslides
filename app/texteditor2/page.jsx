"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Toggle } from '../../components/ui/toggle';
import { 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  GripHorizontal, Type, Move, CornerRightDown
} from 'lucide-react';

// PowerPoint dimensions (standard 16:9)
const SLIDE_WIDTH = 960;  // 10 inches * 96 DPI
const SLIDE_HEIGHT = 540; // 7.5 inches * 96 DPI

const TextElement = ({ 
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
  const resizeStartPos = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const getTextStyle = () => ({
    position: 'absolute',
    left: `${element.position.x}px`,
    top: `${element.position.y}px`,
    width: element.width ? `${element.width}px` : 'auto',
    height: element.height ? `${element.height}px` : 'auto',
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
    cursor: isDragging ? 'grabbing' : 'text',
    backgroundColor: isSelected ? 'rgba(200, 200, 255, 0.1)' : 'transparent',
    minWidth: '50px',
    minHeight: '20px',
    padding: '4px',
    border: isSelected ? '1px solid #666' : '1px solid transparent',
    outline: 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    letterSpacing: `${element.style.letterSpacing || 0}px`,
    lineHeight: element.style.lineHeight || 'normal',
    textTransform: element.style.textTransform || 'none',
    textShadow: element.style.textShadow || 'none',
    transform: `rotate(${element.rotation || 0}deg)`,
    zIndex: isSelected ? 1000 : 1
  });

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
      const rect = elementRef.current.getBoundingClientRect();
      resizeStartPos.current = {
        x: e.clientX,
        y: e.clientY,
        w: rect.width,
        h: rect.height
      };
    } else {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - element.position.x,
        y: e.clientY - element.position.y
      };
    }
    onSelect(id);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(SLIDE_WIDTH - 100, e.clientX - dragStartPos.current.x));
      const newY = Math.max(0, Math.min(SLIDE_HEIGHT - 50, e.clientY - dragStartPos.current.y));
      onPositionChange(id, { x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;
      onUpdate(id, {
        ...element,
        width: Math.max(50, resizeStartPos.current.w + deltaX),
        height: Math.max(20, resizeStartPos.current.h + deltaY)
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
    <div className="group">
      <div
        ref={elementRef}
        style={getTextStyle()}
        onMouseDown={handleMouseDown}
        onClick={() => onSelect(id)}
        contentEditable
        suppressContentEditableWarning={true}
        onInput={(e) => onUpdate(id, { ...element, text: e.target.innerText })}
        className="relative"
      >
        {element.text}
      </div>
      {isSelected && (
        <>
          <div 
            className="resize-handle absolute w-3 h-3 bg-blue-500 rounded-full cursor-se-resize right-0 bottom-0 transform translate-x-1/2 translate-y-1/2"
            style={{
              left: `${element.position.x + (element.width || 100) - 4}px`,
              top: `${element.position.y + (element.height || 20) - 4}px`
            }}
            onMouseDown={handleMouseDown}
          />
          <div 
            className="rotate-handle absolute w-3 h-3 bg-green-500 rounded-full cursor-pointer"
            style={{
              left: `${element.position.x + (element.width || 100) / 2 - 4}px`,
              top: `${element.position.y - 20}px`
            }}
            onMouseDown={(e) => {
              // Rotation logic here
            }}
          />
        </>
      )}
    </div>
  );
};
// ... continuing from Part 1

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
        <div className="text-sm text-gray-600 flex justify-between">
          <span>Position: ({Math.round(element.position.x)}px, {Math.round(element.position.y)}px)</span>
          {element.rotation && <span>Rotation: {element.rotation}°</span>}
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
  
    const handleAddText = () => {
      const newElement = {
        id: Date.now(),
        text: 'Click to edit text',
        position: { x: 100, y: 100 },
        width: 200,
        height: 'auto',
        rotation: 0,
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
        setTextElements(elements => elements.filter(el => el.id !== selectedElement));
        setSelectedElement(null);
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
            <Button
              onClick={handleAddText}
              className="w-full flex items-center justify-center gap-2 mb-4"
            >
              <Type className="h-4 w-4" />
              Add Text
            </Button>
            
            {selectedElement && (
              <Button
                onClick={handleDeleteSelected}
                variant="destructive"
                className="w-full mb-4"
              >
                Delete Selected
              </Button>
            )}
            
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
          </Card>
        </div>
      </div>
    );
  };
  
  export default SlideEditor;