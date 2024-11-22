"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Toggle } from '../../components/ui/toggle';
import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Type, Trash, Download, Plus
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

// Font styles
const fontStyles = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Courier New', value: 'Courier New' }
];

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
    <div className="flex justify-center items-center h-full">
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

// SlideThumbnail component
const SlideThumbnail = ({ slide, isActive, onClick }) => {
  return (
    <div 
      className={`w-full aspect-video bg-white border rounded-lg p-2 cursor-pointer 
        ${isActive ? 'border-blue-500' : 'hover:border-gray-400'}`}
      onClick={onClick}
    >
      <div className="w-full h-full bg-gray-50 flex items-center justify-center text-sm text-gray-500">
        Slide {slide.id}
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
      cursor: isDragging ? 'grabbing' : 'text',
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
    });
  
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
        x: boundedX,
        y: boundedY
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
  
    const getImageStyle = () => ({
      position: 'absolute',
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: `${element.size.width}px`,
      height: `${element.size.height}px`,
      cursor: isDragging ? 'grabbing' : 'grab',
      border: isSelected ? '2px solid #2196F3' : 'none',
      zIndex: isSelected ? 1000 : 1
    });
  
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
        const scale = getScaleFactor(elementRef.current.parentElement.clientWidth);
        
        const newWidth = Math.max(50, initialSize.current.width + (deltaX / scale));
        const newHeight = Math.max(50, initialSize.current.height + (deltaY / scale));
        
        onUpdate(id, {
          ...element,
          size: {
            width: newWidth,
            height: newHeight
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
          x: boundedX,
          y: boundedY
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

// PowerPoint export function
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
          fontSize: Math.round(pixelsToInches(element.style.fontSize) * 72),
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
  
  // Toolbar Component
  const Toolbar = ({ selectedElement, onStyleChange, onAddText, onAddImage }) => {
    return (
      <div className="border-b bg-white p-2 flex items-center space-x-2">
        <div className="flex items-center space-x-2 border-r pr-2">
          <Button variant="outline" size="sm" onClick={onAddText}>
            <Type className="h-4 w-4" />
          </Button>
          <label>
            <Button variant="outline" size="sm" onClick={() => document.getElementById('image-upload').click()}>
              <ImageIcon className="h-4 w-4" />
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
  
        {selectedElement && selectedElement.type === 'text' && (
          <div className="flex items-center space-x-2">
            <select
              value={selectedElement.style.fontFace}
              onChange={(e) => onStyleChange('fontFace', e.target.value)}
              className="h-9 border rounded px-2"
            >
              {fontStyles.map(font => (
                <option key={font.value} value={font.value}>{font.label}</option>
              ))}
            </select>
  
            <input
              type="number"
              value={selectedElement.style.fontSize}
              onChange={(e) => onStyleChange('fontSize', parseInt(e.target.value))}
              className="w-16 h-9 border rounded px-2"
            />
  
            <div className="flex border rounded">
              <Toggle
                pressed={selectedElement.style.bold}
                onPressedChange={(pressed) => onStyleChange('bold', pressed)}
              >
                B
              </Toggle>
              <Toggle
                pressed={selectedElement.style.italic}
                onPressedChange={(pressed) => onStyleChange('italic', pressed)}
              >
                I
              </Toggle>
              <Toggle
                pressed={selectedElement.style.underline}
                onPressedChange={(pressed) => onStyleChange('underline', pressed)}
              >
                U
              </Toggle>
            </div>
  
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
        )}
      </div>
    );
  };
  
  // Sidebar Component
  const Sidebar = ({ slides, activeSlide, onAddSlide, onSelectSlide }) => {
    return (
      <div className="w-64 bg-gray-50 border-r overflow-y-auto">
        <div className="p-4">
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
      </div>
    );
  };

  const SlideEditor = () => {
    const [slides, setSlides] = useState([{ id: 1, elements: [] }]);
    const [activeSlide, setActiveSlide] = useState(1);
    const [textElements, setTextElements] = useState([]);
    const [imageElements, setImageElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
  
    const handleAddSlide = () => {
      const newSlide = {
        id: slides.length + 1,
        elements: []
      };
      setSlides([...slides, newSlide]);
      setActiveSlide(newSlide.id);
    };
  
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
        type: 'text',
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
  
    const handleStyleChange = (property, value) => {
      if (selectedElement) {
        setTextElements(elements =>
          elements.map(el => el.id === selectedElement ? {
            ...el,
            style: { ...el.style, [property]: value }
          } : el)
        );
      }
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
  
    const getSelectedElementDetails = () => {
      const textElement = textElements.find(el => el.id === selectedElement);
      if (textElement) return { ...textElement, type: 'text' };
      const imageElement = imageElements.find(el => el.id === selectedElement);
      if (imageElement) return { ...imageElement, type: 'image' };
      return null;
    };
  
    return (
      <div className="flex flex-col h-screen">
        <Toolbar
          selectedElement={getSelectedElementDetails()}
          onStyleChange={handleStyleChange}
          onAddText={handleAddText}
          onAddImage={handleImageUpload}
        />
  
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            slides={slides}
            activeSlide={activeSlide}
            onAddSlide={handleAddSlide}
            onSelectSlide={setActiveSlide}
          />
  
          <div className="flex-1 bg-gray-100 overflow-auto">
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
      </div>
    );
  };
  
  export default SlideEditor;