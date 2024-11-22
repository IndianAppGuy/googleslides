"use client"
import React, { useState } from 'react';
import SlideContainer from './SlideContainer';
import DraggableText from './DraggableText';
import TextEditor from './TextEditor';  // Previous text properties component

const SlideEditor = () => {
  const [textElements, setTextElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  
  const handleAddText = () => {
    const newElement = {
      id: Date.now(),
      position: { x: 1, y: 1 },  // Default position in inches
      textProps: {
        text: 'New Text',
        align: 'left',
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        subscript: false,
        superscript: false,
        color: '#000000',
        fontFace: 'Arial',
        fontSize: 12,
        transparency: 0,
        lang: 'en-US',
        valign: 'top',
        margin: 0,
        breakLine: false
      }
    };
    
    setTextElements([...textElements, newElement]);
    setSelectedElement(newElement.id);
  };

  const handlePositionChange = (id, newPosition) => {
    setTextElements(elements => 
      elements.map(el => 
        el.id === id 
          ? { ...el, position: newPosition }
          : el
      )
    );
  };

  const handleTextPropsChange = (id, newProps) => {
    setTextElements(elements =>
      elements.map(el =>
        el.id === id
          ? { ...el, textProps: newProps }
          : el
      )
    );
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Text Properties */}
      <div className="w-80 border-r overflow-y-auto">
        <div className="p-4">
          <button
            onClick={handleAddText}
            className="w-full bg-blue-500 text-white rounded px-4 py-2 mb-4"
          >
            Add Text Element
          </button>
          
          {selectedElement && (
            <TextEditor
              textProps={textElements.find(el => el.id === selectedElement)?.textProps}
              onChange={(newProps) => handleTextPropsChange(selectedElement, newProps)}
            />
          )}
        </div>
      </div>

      {/* Main Content - Slide */}
      <div className="flex-1 overflow-hidden">
        <SlideContainer>
          {textElements.map((element) => (
            <DraggableText
              key={element.id}
              textProps={element.textProps}
              position={element.position}
              onPositionChange={(newPos) => handlePositionChange(element.id, newPos)}
              onSelect={() => setSelectedElement(element.id)}
            />
          ))}
        </SlideContainer>
      </div>
    </div>
  );
};

export default SlideEditor;