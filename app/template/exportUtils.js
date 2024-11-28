// utils/exportUtils.js
import pptxgen from 'pptxgenjs';
import { SLIDE_CONFIG } from './presentationUtils';

const generateCurrentMonthAndYear = () => {
  const currentDate = new Date();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
};

const formatSlideNumber = (num) => {
  return num.toString().padStart(2, '0');
};

const convertPercentToInches = (percent, totalInches) => {
  return (parseFloat(percent) / 100) * totalInches;
};

const exportToPowerPoint = async (slides) => {
  try {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';

    // Process each slide
    for (const slide of slides) {
      const pptSlide = pptx.addSlide();

      // Set background based on slide type
      pptSlide.background = { path: SLIDE_CONFIG[`${slide.type.toUpperCase()}_SLIDE`].background };

      // Handle different slide types
      switch (slide.type) {
        case 'title':
          await exportTitleSlide(pptSlide, slide);
          break;
        case 'toc':
          await exportTOCSlide(pptSlide, slide);
          break;
        case 'content':
          await exportContentSlide(pptSlide, slide);
          break;
      }

      // Add custom elements if any
      if (slide.customElements?.length > 0) {
        await addCustomElements(pptSlide, slide.customElements);
      }
    }

    // Save the presentation
    await pptx.writeFile({ fileName: 'presentation.pptx' });
    return true;

  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

const exportTitleSlide = async (pptSlide, slide) => {
  const titleElement = slide.elements.find(el => el.id === 'main-title');
  const subtitleElement = slide.elements.find(el => el.id === 'subtitle');

  // Add title
  pptSlide.addText(titleElement.text, {
    x: convertPercentToInches(titleElement.position.x, 10),
    y: convertPercentToInches(titleElement.position.y, 5.625),
    w: convertPercentToInches(titleElement.position.width, 10),
    h: convertPercentToInches(titleElement.position.height, 5.625),
    fontSize: titleElement.style.fontSize,
    fontFace: titleElement.style.fontFace,
    bold: titleElement.style.bold,
    color: titleElement.style.color.replace('#', ''),
    align: titleElement.style.align,
    valign: titleElement.style.valign
  });

  // Add subtitle
  pptSlide.addText(subtitleElement.text, {
    x: convertPercentToInches(subtitleElement.position.x, 10),
    y: convertPercentToInches(subtitleElement.position.y, 5.625),
    w: convertPercentToInches(subtitleElement.position.width, 10),
    h: convertPercentToInches(subtitleElement.position.height, 5.625),
    fontSize: subtitleElement.style.fontSize,
    fontFace: subtitleElement.style.fontFace,
    color: subtitleElement.style.color.replace('#', ''),
    align: subtitleElement.style.align,
    valign: subtitleElement.style.valign
  });

  // Add date
  pptSlide.addText(generateCurrentMonthAndYear(), {
    x: '5%',
    y: '92%',
    fontSize: 15,
    fontFace: 'Plus Jakarta Sans',
    color: '000000'
  });
};

const exportTOCSlide = async (pptSlide, slide) => {
  // Add TOC title
  pptSlide.addText("Table of content", {
    x: '5.5%',
    y: '10%',
    fontSize: 25,
    fontFace: 'Plus Jakarta Sans',
    bold: true,
    color: '000000'
  });

  // Add TOC items with boxes
  slide.elements.forEach((element, index) => {
    if (element.id === 'toc-title') return;

    // Add box background
    const isAlternate = index % 3 === 1;
    pptSlide.addImage({
      path: isAlternate ? SLIDE_CONFIG.TOC_SLIDE.boxImages.box2 : SLIDE_CONFIG.TOC_SLIDE.boxImages.box1,
      x: convertPercentToInches(element.position.x, 10),
      y: convertPercentToInches(element.position.y, 5.625),
      w: '5%',
      h: '8%'
    });

    // Add number
    pptSlide.addText(formatSlideNumber(element.number), {
      x: convertPercentToInches(element.position.x, 10),
      y: convertPercentToInches(element.position.y, 5.625) + 0.1,
      w: '5%',
      h: '7%',
      fontSize: 14,
      fontFace: 'Plus Jakarta Sans',
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });

    // Add title
    pptSlide.addText(element.text, {
      x: convertPercentToInches(parseFloat(element.position.x) + 5, 10),
      y: convertPercentToInches(element.position.y, 5.625),
      w: '22%',
      h: '8%',
      fontSize: 12,
      fontFace: 'Plus Jakarta Sans',
      bold: true,
      color: '000000',
      valign: 'top'
    });
  });
};

const exportContentSlide = async (pptSlide, slide) => {
  // Add slide title
  const titleElement = slide.elements.find(el => el.id.startsWith('content-title'));
  pptSlide.addText(titleElement.text, {
    x: '5.5%',
    y: '10%',
    fontSize: 25,
    fontFace: 'Plus Jakarta Sans',
    bold: true,
    color: '000000'
  });

  // Add sections
  slide.elements.forEach((element) => {
    if (element.type !== 'section') return;

    // Add section box background
    pptSlide.addImage({
      path: SLIDE_CONFIG.CONTENT_SLIDE.sectionBox.image,
      x: convertPercentToInches(element.position.x, 10),
      y: convertPercentToInches(element.position.y, 5.625),
      w: convertPercentToInches(SLIDE_CONFIG.CONTENT_SLIDE.sectionBox.width, 10),
      h: convertPercentToInches(SLIDE_CONFIG.CONTENT_SLIDE.sectionBox.height, 5.625)
    });

    // Add section title
    pptSlide.addText(element.title, {
      x: convertPercentToInches(parseFloat(element.position.x) + 2, 10),
      y: convertPercentToInches(parseFloat(element.position.y) + 1, 5.625),
      w: '34%',
      h: '0.4',
      fontSize: 13,
      fontFace: 'Plus Jakarta Sans',
      bold: true,
      color: '000000',
      valign: 'center'
    });

    // Add section description
    pptSlide.addText(element.description, {
      x: convertPercentToInches(parseFloat(element.position.x) + 2, 10),
      y: convertPercentToInches(parseFloat(element.position.y) + 8, 5.625),
      w: '36%',
      h: '0.7',
      fontSize: 11,
      fontFace: 'Plus Jakarta Sans Light',
      color: '000000',
      valign: 'top'
    });
  });
};

const addCustomElements = async (pptSlide, elements) => {
  elements.forEach((element) => {
    if (element.type === 'text') {
      pptSlide.addText(element.text, {
        x: convertPercentToInches(element.position.x, 10),
        y: convertPercentToInches(element.position.y, 5.625),
        fontSize: element.style.fontSize,
        fontFace: element.style.fontFace,
        bold: element.style.bold,
        color: element.style.color.replace('#', ''),
        align: element.style.align
      });
    } else if (element.type === 'image') {
      pptSlide.addImage({
        data: element.src, // For base64 images
        x: convertPercentToInches(element.position.x, 10),
        y: convertPercentToInches(element.position.y, 5.625),
        w: convertPercentToInches(element.size.width, 10),
        h: convertPercentToInches(element.size.height, 5.625)
      });
    }
  });
};

export { exportToPowerPoint };