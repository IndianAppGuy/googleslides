"use client"
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PresentationContainer = ({ presentationData }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const generateCurrentMonthAndYear = () => {
    const currentDate = new Date();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentMonth = months[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    return `${currentMonth} ${currentYear}`;
  };

  const nextSlide = () => {
    if (currentSlide < getTotalSlides() - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const getTotalSlides = () => {
    let total = 2; // Title + first TOC page
    total += Math.ceil(presentationData.slides.length / 9); // Additional TOC pages
    presentationData.slides.forEach(slide => {
      total += Math.ceil(slide.sections.length / 6); // Content slides
    });
    return total;
  };

  const renderTitleSlide = () => (
    <div className="relative w-full h-full">
      {/* Background image */}
      <img 
        src="https://djgurnpwsdoqjscwqbsj.supabase.co/storage/v1/object/public/presentation-templates-data/section20_frontSlide.png"
        alt="Front slide background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Title */}
      <div className="absolute left-[15%] top-[25%] w-[70%] h-[30%] flex items-end justify-center">
        <h1 className="text-4xl font-bold font-['Urbanist'] text-black text-center">
          {presentationData.presentationTitle}
        </h1>
      </div>

      {/* Subtitle */}
      <div className="absolute left-[15%] top-[58%] w-[70%] h-[10%]">
        <p className="text-sm font-['Plus_Jakarta_Sans'] font-light text-black text-center">
          {presentationData.presentationSubtitle}
        </p>
      </div>

      {/* Current date */}
      <div className="absolute left-[5%] bottom-[3%]">
        <p className="text-sm font-['Plus_Jakarta_Sans'] font-semibold text-black">
          {generateCurrentMonthAndYear()}
        </p>
      </div>
    </div>
  );

  const renderTOCSlide = (startIndex) => {
    const positions = [
      { x: '7%', y: '25%' }, { x: '38%', y: '25%' }, { x: '69%', y: '25%' },
      { x: '7%', y: '45%' }, { x: '38%', y: '45%' }, { x: '69%', y: '45%' },
      { x: '7%', y: '65%' }, { x: '38%', y: '65%' }, { x: '69%', y: '65%' }
    ];

    return (
      <div className="relative w-full h-full">
        {/* Background image */}
        <img 
          src="https://djgurnpwsdoqjscwqbsj.supabase.co/storage/v1/object/public/presentation-templates-data/section20_bckgrd.png"
          alt="TOC background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* TOC Title */}
        <h2 className="absolute left-[5.5%] top-[10%] text-2xl font-bold font-['Plus_Jakarta_Sans'] text-black">
          Table of content
        </h2>

        {/* TOC Items */}
        {presentationData.slides.slice(startIndex, startIndex + 9).map((slide, idx) => {
          const pos = positions[idx];
          const slideNumber = (startIndex + idx + 1).toString().padStart(2, '0');
          const isAlternate = idx % 3 === 1; // Middle column uses alternate box
          
          return (
            <div 
              key={idx} 
              className="absolute" 
              style={{ left: pos.x, top: pos.y }}
            >
              {/* Box background */}
              <img 
                src={isAlternate ? 
                  "https://djgurnpwsdoqjscwqbsj.supabase.co/storage/v1/object/public/presentation-templates-data/section20_TOC_box2.png" :
                  "https://djgurnpwsdoqjscwqbsj.supabase.co/storage/v1/object/public/presentation-templates-data/section20_TOC_box1.png"
                }
                alt={`TOC box ${isAlternate ? '2' : '1'}`}
                className="absolute w-[5%] h-8"
              />

              {/* Number */}
              <div className="relative w-[5%] h-8 flex items-center justify-center">
                <span className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
                  {slideNumber}
                </span>
              </div>

              {/* Title */}
              <div className="absolute left-[calc(5%+8px)] top-0 w-[22%]">
                <p className="text-xs font-bold font-['Plus_Jakarta_Sans'] text-black leading-tight">
                  {slide.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderContentSlide = (slideData) => {
    return (
      <div className="relative w-full h-full">
        {/* Background image */}
        <img 
          src="https://djgurnpwsdoqjscwqbsj.supabase.co/storage/v1/object/public/presentation-templates-data/section20_bckgrd.png"
          alt="Content slide background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Slide Title */}
        <h2 className="absolute left-[5.5%] top-[10%] text-2xl font-bold font-['Plus_Jakarta_Sans'] text-black">
          {slideData.title}
        </h2>

        {/* Content Sections */}
        <div className="absolute left-[7%] top-[22%] w-[86%] grid grid-cols-2 gap-x-[3%] gap-y-[3%]">
          {slideData.sections.slice(0, 6).map((section, idx) => {
            const sectionNumber = (idx + 1).toString().padStart(2, '0');
            
            return (
              <div key={idx} className="relative h-[22%]">
                {/* Section box background */}
                <img 
                  src="https://djgurnpwsdoqjscwqbsj.supabase.co/storage/v1/object/public/presentation-templates-data/section20_list1_box.png"
                  alt="Section box"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Section content */}
                <div className="relative p-4">
                  <h3 className="text-sm font-bold font-['Plus_Jakarta_Sans'] text-black mb-2">
                    {`${sectionNumber}. ${section.title}`}
                  </h3>
                  <p className="text-xs font-['Plus_Jakarta_Sans'] font-light text-black">
                    {section.description.split(' ').slice(0, 20).join(' ')}
                    {section.description.split(' ').length > 20 ? '...' : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getCurrentSlideContent = () => {
    if (currentSlide === 0) {
      return renderTitleSlide();
    }

    let slideIndex = currentSlide - 1;
    const tocPages = Math.ceil(presentationData.slides.length / 9);
    
    if (slideIndex < tocPages) {
      return renderTOCSlide(slideIndex * 9);
    }

    slideIndex -= tocPages;
    let currentContentSlide = null;
    let remainingSlides = slideIndex;

    for (const slide of presentationData.slides) {
      const slidePages = Math.ceil(slide.sections.length / 6);
      if (remainingSlides < slidePages) {
        currentContentSlide = slide;
        break;
      }
      remainingSlides -= slidePages;
    }

    return currentContentSlide ? renderContentSlide(currentContentSlide) : null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative aspect-[16/9] bg-white shadow-lg overflow-hidden">
        {getCurrentSlideContent()}
        
        {/* Navigation */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === getTotalSlides() - 1}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-4 left-4 text-sm text-gray-600">
          {`${currentSlide + 1} / ${getTotalSlides()}`}
        </div>
      </div>
    </div>
  );
};

export default PresentationContainer;