// components/PresentationEditor.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { 
  ChevronLeft, ChevronRight, 
  Type, Image as ImageIcon, Download, Trash 
} from 'lucide-react';
import PresentationContainer from './presentationContainer';
import { transformData } from './presentationUtils';
import { exportToPowerPoint } from './exportUtils';

const PresentationEditor = ({ initialData }) => {
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);

  useEffect(() => {
    const transformedSlides = transformData(initialData);
    setSlides(transformedSlides);
  }, [initialData]);

  const handleAddText = () => {
    const newElement = {
      id: `custom-text-${Date.now()}`,
      type: 'text',
      text: 'New Text',
      position: { x: '15%', y: '25%' },
      style: {
        fontFace: 'Plus Jakarta Sans',
        fontSize: 14,
        color: '#000000',
        bold: false,
        align: 'left'
      },
      isTemplate: false
    };

    setSlides(prev => prev.map((slide, idx) => 
      idx === currentSlideIndex
        ? { ...slide, customElements: [...(slide.customElements || []), newElement] }
        : slide
    ));
  };

  const handleAddImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const newElement = {
        id: `custom-image-${Date.now()}`,
        type: 'image',
        src: e.target.result,
        position: { x: '15%', y: '25%' },
        size: { width: '30%', height: '30%' },
        isTemplate: false
      };

      setSlides(prev => prev.map((slide, idx) => 
        idx === currentSlideIndex
          ? { ...slide, customElements: [...(slide.customElements || []), newElement] }
          : slide
      ));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteElement = () => {
    if (!selectedElement) return;

    setSlides(prev => prev.map((slide, idx) => {
      if (idx !== currentSlideIndex) return slide;

      return {
        ...slide,
        elements: slide.elements.filter(el => el.id !== selectedElement),
        customElements: (slide.customElements || []).filter(el => el.id !== selectedElement)
      };
    }));

    setSelectedElement(null);
  };

  const handleElementUpdate = (elementId, updatedElement) => {
    setSlides(prev => prev.map((slide, idx) => {
      if (idx !== currentSlideIndex) return slide;

      // Check template elements
      const templateIndex = slide.elements.findIndex(el => el.id === elementId);
      if (templateIndex !== -1) {
        const newElements = [...slide.elements];
        newElements[templateIndex] = updatedElement;
        return { ...slide, elements: newElements };
      }

      // Check custom elements
      const customIndex = (slide.customElements || []).findIndex(el => el.id === elementId);
      if (customIndex !== -1) {
        const newCustomElements = [...(slide.customElements || [])];
        newCustomElements[customIndex] = updatedElement;
        return { ...slide, customElements: newCustomElements };
      }

      return slide;
    }));
  };

  const handlePositionChange = (elementId, newPosition) => {
    setSlides(prev => prev.map((slide, idx) => {
      if (idx !== currentSlideIndex) return slide;

      // Update element position in either template or custom elements
      const updatePosition = (elements) =>
        elements.map(el =>
          el.id === elementId
            ? { ...el, position: newPosition }
            : el
        );

      return {
        ...slide,
        elements: updatePosition(slide.elements),
        customElements: updatePosition(slide.customElements || [])
      };
    }));
  };

  const handleExport = async () => {
    try {
      await exportToPowerPoint(slides);
      alert('Presentation exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export presentation. Please try again.');
    }
  };

  const currentSlide = slides[currentSlideIndex];

  const ThumbnailPreview = ({ slide }) => {
    return (
      <div className="relative w-full aspect-[16/9] bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
        {/* Wrapper div for scaling and centering */}
        <div className="absolute inset-0 w-full h-full transform-gpu">
          {/* Scale container */}
          <div 
            className="absolute"
            style={{
              width: '100%',
              height: '100%',
              transformOrigin: '0 0',
              transform: 'scale(0.2)',
            }}
          >
            {/* Content container */}
            <div 
              style={{
                width: '500%',
                height: '500%',
                transform: 'scale(1)',
                transformOrigin: '0 0'
              }}
            >
              <PresentationContainer
                slide={slide}
                scale={1}
                onSelectElement={() => {}}
                onElementUpdate={() => {}}
                onPositionChange={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
            <div className="flex h-screen bg-gray-100">
            {/* Slide Thumbnails */}
            <div className="w-64 bg-white border-r p-4 overflow-y-auto transparent-container">
            <div className="space-y-2">
                {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`
                    p-3 rounded-lg cursor-pointer transition-colors
                    ${currentSlideIndex === index ? 'bg-blue-100' : 'hover:bg-gray-100'}
                    `}
                    onClick={() => {
                    setCurrentSlideIndex(index);
                    setSelectedElement(null);
                    }}
                >
                    {/* Replace the old container with ThumbnailPreview */}
                    <ThumbnailPreview slide={slide} />
                    <div className="mt-1 text-sm text-gray-600">
                    {slide.type === 'title' ? 'Title Slide' :
                    slide.type === 'toc' ? 'Table of Contents' :
                    slide.title || `Slide ${index + 1}`}
                    </div>
                </div>
                ))}
            </div>
            </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b p-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <Button onClick={handleAddText} variant="outline">
              <Type className="mr-2 h-4 w-4" />
              Add Text
            </Button>
            <label>
              <Button variant="outline" asChild>
                <span>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Add Image
                </span>
              </Button>
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAddImage}
              />
            </label>
            {selectedElement && (
              <Button 
                variant="outline" 
                onClick={handleDeleteElement}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentSlideIndex === 0}
                onClick={() => {
                  setCurrentSlideIndex(prev => prev - 1);
                  setSelectedElement(null);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-2 text-sm text-gray-500">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => {
                  setCurrentSlideIndex(prev => prev + 1);
                  setSelectedElement(null);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Editor Canvas */}
        <div className="flex-1 p-8 overflow-auto">
          {currentSlide && (
            <PresentationContainer
              slide={currentSlide}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onElementUpdate={handleElementUpdate}
              onPositionChange={handlePositionChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PresentationEditor;