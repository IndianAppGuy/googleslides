// components/PresentationContainer.jsx
import React from 'react';
import TextElement from './textElement';
import ImageElement from './imageElement';
import SectionElement from './sectionElement';
import { SLIDE_CONFIG, getSlideBackground } from './presentationUtils';

const PresentationContainer = ({
  slide,
  selectedElement,
  onSelectElement,
  onElementUpdate,
  onPositionChange,
  scale = 1
}) => {
  const renderElement = (element) => {
    const props = {
      key: element.id,
      element,
      isSelected: selectedElement === element.id,
      onSelect: onSelectElement,
      onUpdate: onElementUpdate,
      onPositionChange: onPositionChange
    };

    switch (element.type) {
      case 'text':
        return <TextElement {...props} />;
      case 'image':
        return <ImageElement {...props} />;
      case 'section':
        return <SectionElement {...props} />;
      default:
        return null;
    }
  };

  const renderTocBoxes = () => {
    if (slide.type !== 'toc') return null;

    const { TOC_SLIDE } = SLIDE_CONFIG;
    return slide.elements
      .filter(el => el.id !== 'toc-title')
      .map((element, idx) => {
        const isAlternate = idx % 3 === 1;
        return (
          <img
            key={`box-${element.id}`}
            src={isAlternate ? TOC_SLIDE.boxImages.box2 : TOC_SLIDE.boxImages.box1}
            alt=""
            className="absolute"
            style={{
              left: element.position.x,
              top: element.position.y,
              width: '5%',
              height: '8%',
              zIndex: 0
            }}
          />
        );
      });
  };

  return (
    <div 
      className="relative bg-white shadow-lg mx-auto"
      style={{
        width: '100%',
        maxWidth: '1280px',
        aspectRatio: '16/9',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        backgroundImage: `url(${getSlideBackground(slide.type)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      onClick={() => onSelectElement(null)}
    >
      {/* Safe zone indicator */}
      <div 
        className="absolute pointer-events-none border border-dashed border-gray-300 opacity-50"
        style={{
          top: '24px',
          left: '24px',
          right: '24px',
          bottom: '24px'
        }}
      />

      {/* TOC Boxes Background */}
      {renderTocBoxes()}

      {/* Template Elements */}
      {slide.elements.map(renderElement)}

      {/* Custom Elements */}
      {slide.customElements?.map(renderElement)}
    </div>
  );
};

export default PresentationContainer;