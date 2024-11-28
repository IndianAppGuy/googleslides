// types/presentation.ts

export interface ElementStyle {
    fontFace?: string;
    fontSize?: number;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    align?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
  }
  
  export interface Position {
    x: string;
    y: string;
    width?: string;
    height?: string;
  }
  
  export interface TextElement {
    id: string;
    type: 'text';
    text: string;
    position: Position;
    style: ElementStyle;
    isTemplate?: boolean;
  }
  
  export interface ImageElement {
    id: string;
    type: 'image';
    src: string;
    position: Position;
    size: {
      width: string;
      height: string;
    };
    isTemplate?: boolean;
  }
  
  export interface SectionElement {
    id: string;
    type: 'section';
    title: string;
    description: string;
    position: Position;
    style: {
      title: ElementStyle;
      description: ElementStyle;
    };
    isTemplate?: boolean;
  }
  
  export type SlideElement = TextElement | ImageElement | SectionElement;
  
  export interface Slide {
    type: 'title' | 'toc' | 'content';
    title?: string;
    elements: SlideElement[];
    customElements: SlideElement[];
  }
  
  export interface PresentationData {
    presentationTitle: string;
    presentationSubtitle: string;
    slides: {
      title: string;
      sections: {
        title: string;
        description: string;
      }[];
    }[];
  }