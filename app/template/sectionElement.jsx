// components/elements/SectionElement.jsx
import React from 'react';
import { SLIDE_CONFIG } from './presentationUtils';

export const SectionElement = ({
  element,
  isSelected,
  onSelect,
  onUpdate
}) => {
  const { CONTENT_SLIDE } = SLIDE_CONFIG;

  return (
    <div
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: CONTENT_SLIDE.sectionBox.width,
        height: CONTENT_SLIDE.sectionBox.height,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
    >
      {/* Background Box */}
      <img 
        src={CONTENT_SLIDE.sectionBox.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Content Container */}
      <div className="relative p-4">
        {/* Title */}
        <div
          contentEditable
          suppressContentEditableWarning
          className="mb-2"
          style={{
            fontFamily: element.style.title.fontFace,
            fontSize: `${element.style.title.fontSize}px`,
            fontWeight: element.style.title.bold ? 'bold' : 'normal',
            color: element.style.title.color,
            border: isSelected ? '1px solid rgba(33, 150, 243, 0.5)' : 'none',
            padding: '2px',
            outline: 'none'
          }}
          onInput={(e) => onUpdate(element.id, {
            ...element,
            title: e.target.innerText
          })}
        >
          {element.title}
        </div>

        {/* Description */}
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            fontFamily: element.style.description.fontFace,
            fontSize: `${element.style.description.fontSize}px`,
            color: element.style.description.color,
            border: isSelected ? '1px solid rgba(33, 150, 243, 0.5)' : 'none',
            padding: '2px',
            outline: 'none',
            maxHeight: '80%',
            overflowY: 'auto'
          }}
          onInput={(e) => onUpdate(element.id, {
            ...element,
            description: e.target.innerText
          })}
        >
          {element.description}
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div 
          className="absolute inset-0 border-2 border-blue-500 pointer-events-none"
          style={{ borderRadius: '4px' }}
        />
      )}
    </div>
  );
};

export default SectionElement;