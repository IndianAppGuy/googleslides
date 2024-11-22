"use client"
import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

import { Toggle } from '../components/ui/toggle';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

const TextEditor = () => {
  const [textProps, setTextProps] = useState({
    text: 'Sample Text',
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
  });

  const handleChange = (property, value) => {
    setTextProps(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const fonts = ['Arial', 'Calibri', 'Times New Roman', 'Helvetica', 'Verdana'];
  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' }
  ];

  const getTextStyle = () => ({
    fontFamily: textProps.fontFace,
    fontSize: `${textProps.fontSize}px`,
    fontWeight: textProps.bold ? 'bold' : 'normal',
    fontStyle: textProps.italic ? 'italic' : 'normal',
    textDecoration: [
      textProps.underline ? 'underline' : '',
      textProps.strike ? 'line-through' : ''
    ].filter(Boolean).join(' '),
    textAlign: textProps.align,
    color: textProps.color,
    opacity: 1 - (textProps.transparency / 100),
    margin: `${textProps.margin}px`,
    verticalAlign: textProps.valign,
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Text Preview Area */}
      <Card>
        <CardContent className="p-6">
          <div style={getTextStyle()} className="min-h-24 p-4 border rounded">
            {textProps.text}
          </div>
        </CardContent>
      </Card>

      {/* Text Input */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Text Content</label>
            <Input
              value={textProps.text}
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Text Alignment */}
          <div className="flex space-x-2">
            <Button
              variant={textProps.align === 'left' ? 'default' : 'outline'}
              onClick={() => handleChange('align', 'left')}
              className="p-2"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={textProps.align === 'center' ? 'default' : 'outline'}
              onClick={() => handleChange('align', 'center')}
              className="p-2"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={textProps.align === 'right' ? 'default' : 'outline'}
              onClick={() => handleChange('align', 'right')}
              className="p-2"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              variant={textProps.align === 'justify' ? 'default' : 'outline'}
              onClick={() => handleChange('align', 'justify')}
              className="p-2"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          {/* Text Style Toggles */}
          <div className="flex flex-wrap gap-2">
            <Toggle
              pressed={textProps.bold}
              onPressedChange={(pressed) => handleChange('bold', pressed)}
              className="data-[state=on]:bg-blue-500"
            >
              B
            </Toggle>
            <Toggle
              pressed={textProps.italic}
              onPressedChange={(pressed) => handleChange('italic', pressed)}
              className="italic data-[state=on]:bg-blue-500"
            >
              I
            </Toggle>
            <Toggle
              pressed={textProps.underline}
              onPressedChange={(pressed) => handleChange('underline', pressed)}
              className="underline data-[state=on]:bg-blue-500"
            >
              U
            </Toggle>
            <Toggle
              pressed={textProps.strike}
              onPressedChange={(pressed) => handleChange('strike', pressed)}
              className="line-through data-[state=on]:bg-blue-500"
            >
              S
            </Toggle>
            <Toggle
              pressed={textProps.subscript}
              onPressedChange={(pressed) => handleChange('subscript', pressed)}
              className="data-[state=on]:bg-blue-500"
            >
              ₓ
            </Toggle>
            <Toggle
              pressed={textProps.superscript}
              onPressedChange={(pressed) => handleChange('superscript', pressed)}
              className="data-[state=on]:bg-blue-500"
            >
              ˣ
            </Toggle>
          </div>

          {/* Font Properties */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Font Family</label>
              <select
                value={textProps.fontFace}
                onChange={(e) => handleChange('fontFace', e.target.value)}
                className="w-full p-2 border rounded"
              >
                {fonts.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <select
                value={textProps.lang}
                onChange={(e) => handleChange('lang', e.target.value)}
                className="w-full p-2 border rounded"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Numeric Properties */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Font Size: {textProps.fontSize}px</label>
              <input
                type="range"
                min="8"
                max="72"
                value={textProps.fontSize}
                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Transparency: {textProps.transparency}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={textProps.transparency}
                onChange={(e) => handleChange('transparency', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Text Color</label>
            <input
              type="color"
              value={textProps.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-full h-10"
            />
          </div>

          {/* Vertical Alignment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Vertical Alignment</label>
            <select
              value={textProps.valign}
              onChange={(e) => handleChange('valign', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>

          {/* Margin */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Margin: {textProps.margin}px</label>
            <input
              type="range"
              min="0"
              max="50"
              value={textProps.margin}
              onChange={(e) => handleChange('margin', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Break Line Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={textProps.breakLine}
              onChange={(e) => handleChange('breakLine', e.target.checked)}
              id="breakLine"
            />
            <label htmlFor="breakLine" className="text-sm font-medium">Break Line</label>
          </div>
        </CardContent>
      </Card>

      {/* Debug: Current Properties */}
      <Card>
        <CardContent className="p-6">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(textProps, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextEditor;