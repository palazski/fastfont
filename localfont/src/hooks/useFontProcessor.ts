import { useState } from 'react';
import { FontData } from '@/types/font';
import { calculateFontMetrics, estimateFileSize, generateBase64Font } from '@/utils/fontUtils';
import { PREVIEW_TEMPLATES } from '@/constants/font';
import { v4 as uuidv4 } from 'uuid';  // Add this import

export const useFontProcessor = () => {
  const [fonts, setFonts] = useState<FontData[]>([{
    id: uuidv4(),  // Add this line
    url: '',
    name: '',
    cssContent: '',
    weights: [],
    metrics: null,
    error: '',
    base64Enabled: false,
    base64Content: '',
    estimatedSize: 0,
    subsetText: PREVIEW_TEMPLATES.pangram,
    previewSettings: {
      size: 16,
      weight: 400,
      color: '#000000',
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    variableFont: false,
    variableSettings: {},
  }]);

  const [loading, setLoading] = useState(false);

  const extractFontInfo = async (url: string, index: number) => {
    setLoading(true);
    try {
      if (!url.includes('fonts.googleapis.com')) {
        throw new Error('Please provide a valid Google Fonts URL');
      }

      const response = await fetch(url);
      const cssContent = await response.text();

      // Extract font family name
      const familyMatch = cssContent.match(/font-family:\s*['"]([^'"]+)['"]/);
      const fontName = familyMatch ? familyMatch[1] : '';

      if (!fontName) {
        throw new Error('Could not extract font family name');
      }

      // Extract font weights
      const weightMatches = cssContent.match(/font-weight:\s*(\d+)/g);
      const weights = weightMatches 
        ? [...new Set(weightMatches.map(w => w.match(/\d+/)?.[0] || ''))]
        : [];

      // Check if it's a variable font
      const isVariable = cssContent.includes('font-variation-settings') || 
                        cssContent.includes('@supports (font-variation-settings:');

      // Generate base64 version
      const base64Content = await (async () => {
        const matches = cssContent.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g) || [];
        let updatedCssContent = cssContent;
        for (const match of matches) {
          const url = match.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1];
          if (url) {
            const base64 = await generateBase64Font(url);
            updatedCssContent = updatedCssContent.replace(match, base64 ? `url(${base64})` : match);
          }
        }
        return updatedCssContent;
      })();

      // Create font face to calculate metrics
      const style = document.createElement('style');
      style.textContent = cssContent;
      document.head.appendChild(style);

      // Wait for font to load
      await document.fonts.ready;

      const metrics = calculateFontMetrics(fontName);
      const estimatedSize = estimateFileSize(cssContent);

      const updatedFonts = [...fonts];
      updatedFonts[index] = {
        ...updatedFonts[index],
        url,
        name: fontName,
        cssContent,
        weights,
        metrics,
        error: '',
        base64Content,
        estimatedSize,
        variableFont: isVariable,
        variableSettings: isVariable ? { weight: 400 } : {},
      };

      setFonts(updatedFonts);
      document.head.removeChild(style);
    } catch (error) {
      const updatedFonts = [...fonts];
      updatedFonts[index] = {
        ...updatedFonts[index],
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
      setFonts(updatedFonts);
    } finally {
      setLoading(false);
    }
  };

  const addFont = () => {
    setFonts([...fonts, {
      id: uuidv4(),  // Add this line
      url: '',
      name: '',
      cssContent: '',
      weights: [],
      metrics: null,
      error: '',
      base64Enabled: false,
      base64Content: '',
      estimatedSize: 0,
      subsetText: PREVIEW_TEMPLATES.pangram,
      previewSettings: {
        size: 16,
        weight: 400,
        color: '#000000',
        lineHeight: 1.5,
        letterSpacing: 0,
      },
      variableFont: false,
      variableSettings: {},
    }]);
  };

  return {
    fonts,
    setFonts,
    loading,
    extractFontInfo,
    addFont
  };
};
