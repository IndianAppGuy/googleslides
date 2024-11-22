"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, GripHorizontal } from 'lucide-react';

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
  const [isEditing, setIsEditing] = useState(false);
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
    cursor: isDragging ? 'grabbing' : 'move',
    minWidth: '50px',
    minHeight: '20px',
    padding: '4px',
    border: isSelected ? '1px dashed #666' : '1px dashed transparent',
    outline: 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  });

  const handleMouseDown = (e) => {
    if (e.target === elementRef.current) {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - element.position.x,
        y: e.clientY - element.position.y
      };
      onSelect(id);
      e.preventDefault();
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

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
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
      onDoubleClick={handleDoubleClick}
      onClick={() => onSelect(id)}
      contentEditable={isEditing}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      onInput={(e) => onUpdate(id, { ...element, text: e.target.innerText })}
    >
      {element.text}
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

  return (
    <div className="p-4 space-y-4">
      <div className="text-sm text-gray-600">
        Position: ({Math.round(element.position.x)}px, {Math.round(element.position.y)}px)
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
          {['Arial', 'Times New Roman', 'Calibri', 'Helvetica', 'Verdana'].map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Font Size: {element.style.fontSize}px</label>
        <input
          type="range"
          min="8"
          max="72"
          value={element.style.fontSize}
          onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
          className="w-full"
        />
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
    </div>
  );
};

const SlideEditor = () => {
  const [textElements, setTextElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);

  const handleAddText = () => {
    const newElement = {
      id: Date.now(),
      text: 'Double click to edit',
      position: { x: 100, y: 100 },
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
        margin: 0
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

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-80 border-r overflow-y-auto bg-gray-50">
        <div className="p-4">
          <Button
            onClick={handleAddText}
            className="w-full flex items-center justify-center gap-2 mb-4"
          >
            <GripHorizontal className="h-4 w-4" />
            Add Text
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