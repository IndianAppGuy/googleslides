// utils/presentationUtils.js

// Constants for slide dimensions and positioning
export const SLIDE_CONFIG = {
    TITLE_SLIDE: {
      background: "https://djgurnpwsdoqjscwqbsj.supabase.co/storage/v1/object/public/presentation-templates-data/section20_frontSlide.png",
      title: {
        x: "15%",
        y: "25%",
        width: "70%",
        height: "30%",
        style: {
          fontFace: "Urbanist",
          fontSize: 40,
          color: "#000000",
          bold: true,
          align: "center",
          valign: "bottom"
        }
      },
      subtitle: {
        x: "15%",
        y: "58%",
        width: "70%",
        height: "10%",
        style: {
          fontFace: "Plus Jakarta Sans Light",
          fontSize: 15,
          color: "#000000",
          align: "center",
          valign: "top"
        }
      }
    },
    TOC_SLIDE: {
      background: "https://djgurnpwsdoqjscwqbsj.supabase.co/storage/v1/object/public/presentation-templates-data/section20_bckgrd.png",
      title: {
        x: "5.5%",
        y: "10%",
        style: {
          fontFace: "Plus Jakarta Sans",
          fontSize: 25,
          color: "#000000",
          bold: true
        }
      },
      gridPositions: [
        { x: '7%', y: '25%' },
        { x: '38%', y: '25%' },
        { x: '69%', y: '25%' },
        { x: '7%', y: '45%' },
        { x: '38%', y: '45%' },
        { x: '69%', y: '45%' },
        { x: '7%', y: '65%' },
        { x: '38%', y: '65%' },
        { x: '69%', y: '65%' }
      ],
      boxDimensions: {
        width: '5%',
        height: '8%',
        titleOffset: '7%'
      },
      boxImages: {
        box1: "https://djgurnpwsdoqjscwqbsj.supabase.co/storage/v1/object/public/presentation-templates-data/section20_TOC_box1.png",
        box2: "https://djgurnpwsdoqjscwqbsj.supabase.co/storage/v1/object/public/presentation-templates-data/section20_TOC_box2.png"
      }
    },
    CONTENT_SLIDE: {
      background: "https://djgurnpwsdoqjscwqbsj.supabase.co/storage/v1/object/public/presentation-templates-data/section20_bckgrd.png",
      title: {
        x: "5.5%",
        y: "10%",
        style: {
          fontFace: "Plus Jakarta Sans",
          fontSize: 25,
          color: "#000000",
          bold: true
        }
      },
      sectionBox: {
        image: "https://djgurnpwsdoqjscwqbsj.supabase.co/storage/v1/object/public/presentation-templates-data/section20_list1_box.png",
        width: "40%",
        height: "22%"
      },
      gridPositions: [
        { x: '7%', y: '22%' },
        { x: '50%', y: '22%' },
        { x: '7%', y: '47%' },
        { x: '50%', y: '47%' },
        { x: '7%', y: '72%' },
        { x: '50%', y: '72%' }
      ]
    }
  };
  
  // Transform input data to presentation format
  export const transformData = (data) => {
    const slides = [];
  
    // Add title slide
    slides.push({
      type: 'title',
      elements: [
        {
          id: 'main-title',
          type: 'text',
          text: data.presentationTitle,
          position: SLIDE_CONFIG.TITLE_SLIDE.title,
          style: SLIDE_CONFIG.TITLE_SLIDE.title.style,
          isTemplate: true
        },
        {
          id: 'subtitle',
          type: 'text',
          text: data.presentationSubtitle,
          position: SLIDE_CONFIG.TITLE_SLIDE.subtitle,
          style: SLIDE_CONFIG.TITLE_SLIDE.subtitle.style,
          isTemplate: true
        }
      ],
      customElements: []
    });
  
    // Add TOC slides
    const tocSlides = Math.ceil(data.slides.length / 9);
    for (let i = 0; i < tocSlides; i++) {
      const tocSlide = {
        type: 'toc',
        elements: [
          {
            id: 'toc-title',
            type: 'text',
            text: "Table of content",
            position: SLIDE_CONFIG.TOC_SLIDE.title,
            style: SLIDE_CONFIG.TOC_SLIDE.title.style,
            isTemplate: true
          }
        ],
        customElements: []
      };
  
      // Add TOC items
      const startIdx = i * 9;
      const endIdx = Math.min((i + 1) * 9, data.slides.length);
      for (let j = startIdx; j < endIdx; j++) {
        const position = SLIDE_CONFIG.TOC_SLIDE.gridPositions[j - startIdx];
        tocSlide.elements.push({
          id: `toc-item-${j + 1}`,
          type: 'text',
          text: data.slides[j].title,
          position,
          number: j + 1,
          style: {
            fontFace: "Plus Jakarta Sans",
            fontSize: 12,
            color: "#000000",
            bold: true
          },
          isTemplate: true
        });
      }
  
      slides.push(tocSlide);
    }
  
    // Add content slides
    data.slides.forEach((slide, slideIndex) => {
      const contentSlides = Math.ceil(slide.sections.length / 6);
      for (let i = 0; i < contentSlides; i++) {
        const contentSlide = {
          type: 'content',
          title: slide.title,
          elements: [
            {
              id: `content-title-${slideIndex}-${i}`,
              type: 'text',
              text: slide.title,
              position: SLIDE_CONFIG.CONTENT_SLIDE.title,
              style: SLIDE_CONFIG.CONTENT_SLIDE.title.style,
              isTemplate: true
            }
          ],
          customElements: []
        };
  
        // Add section elements
        const startIdx = i * 6;
        const endIdx = Math.min((i + 1) * 6, slide.sections.length);
        for (let j = startIdx; j < endIdx; j++) {
          const section = slide.sections[j];
          const position = SLIDE_CONFIG.CONTENT_SLIDE.gridPositions[j - startIdx];
  
          contentSlide.elements.push({
            id: `section-${slideIndex}-${j}`,
            type: 'section',
            title: section.title,
            description: section.description,
            position,
            style: {
              title: {
                fontFace: "Plus Jakarta Sans",
                fontSize: 13,
                color: "#000000",
                bold: true
              },
              description: {
                fontFace: "Plus Jakarta Sans Light",
                fontSize: 11,
                color: "#000000"
              }
            },
            isTemplate: true
          });
        }
  
        slides.push(contentSlide);
      }
    });
  
    return slides;
  };
  
  // Generate slide background based on type
  export const getSlideBackground = (type) => {
    switch (type) {
      case 'title':
        return SLIDE_CONFIG.TITLE_SLIDE.background;
      case 'toc':
      case 'content':
        return SLIDE_CONFIG.CONTENT_SLIDE.background;
      default:
        return SLIDE_CONFIG.CONTENT_SLIDE.background;
    }
  };