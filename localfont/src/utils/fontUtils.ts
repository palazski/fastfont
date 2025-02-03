import { debounce } from 'lodash';
import JSZip from 'jszip';

export interface FontMetrics {
  capHeight: number;
  xHeight: number;
  baseline: number;
  lineHeight: number;
}

export const PREVIEW_TEMPLATES = {
  pangram: 'The quick brown fox jumps over the lazy dog',
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  paragraphs: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
};

export const COMMON_FONT_PAIRS = [
  { primary: 'Inter', secondary: 'Roboto' },
  { primary: 'Playfair Display', secondary: 'Source Sans Pro' },
  { primary: 'Oswald', secondary: 'Open Sans' },
  { primary: 'Montserrat', secondary: 'Merriweather' },
  { primary: 'Lato', secondary: 'Poppins' },
];

export const calculateFontMetrics = (fontFamily: string): FontMetrics => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.font = `normal 100px ${fontFamily}`;
  const metrics = ctx.measureText('Hx');
  
  return {
    capHeight: Math.abs(metrics.actualBoundingBoxAscent),
    xHeight: Math.abs(metrics.fontBoundingBoxAscent * 0.7),
    baseline: metrics.actualBoundingBoxDescent,
    lineHeight: metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
  };
};

export const estimateFileSize = (css: string): number => {
  const compressionRatio = 0.6;
  return Math.round((css.length * compressionRatio) / 1024);
};

export const generateBase64Font = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error generating base64 font:', error);
    return null;
  }
};

export const generateCSSInJSSnippet = (fontName: string, cssContent: string) => {
  const styledComponents = `
import { createGlobalStyle } from 'styled-components';

const GlobalFontStyle = createGlobalStyle\`
  ${cssContent}
\`;`;

  const emotion = `
import { css, Global } from '@emotion/react';

const globalFontStyles = css\`
  ${cssContent}
\`;

const GlobalFontStyle = () => (
  <Global styles={globalFontStyles} />
);`;

  return {
    styledComponents,
    emotion,
  };
};

export const debouncedUpdatePreview = debounce((callback: (value: string) => void, value: string) => {
  callback(value);
}, 300);

export const generateFallbackChain = (fontFamily: string): string => {
  const systemFonts = {
    sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue'],
    serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times'],
    mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New'],
  };

  const isSerif = /georgia|times|playfair|garamond|merriweather/i.test(fontFamily);
  const isMono = /mono|console|code|hack/i.test(fontFamily);
  
  const fallbacks = isSerif ? systemFonts.serif : 
                   isMono ? systemFonts.mono : 
                   systemFonts.sans;
                   
  return [fontFamily, ...fallbacks].join(', ');
};

export const generateSubsetRange = (text: string): string => {
  const uniqueChars = [...new Set(text)].sort();
  const ranges: string[] = [];
  let start = uniqueChars[0].charCodeAt(0);
  let prev = start;

  for (let i = 1; i <= uniqueChars.length; i++) {
    if (i === uniqueChars.length || uniqueChars[i].charCodeAt(0) - prev > 1) {
      const end = prev;
      ranges.push(start === end ? 
        `U+${start.toString(16).toUpperCase()}` : 
        `U+${start.toString(16).toUpperCase()}-${end.toString(16).toUpperCase()}`
      );
      if (i < uniqueChars.length) {
        start = uniqueChars[i].charCodeAt(0);
        prev = start;
      }
    } else {
      prev = uniqueChars[i].charCodeAt(0);
    }
  }

  return ranges.join(', ');
};

export const downloadWoff2Files = async (fontUrls: string[], fontName: string) => {
  const zip = new JSZip();
  const folder = zip.folder(fontName);
  
  try {
    const downloads = fontUrls.map(async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split('/').pop() || `${fontName}.woff2`;
      folder?.file(fileName, blob);
    });

    await Promise.all(downloads);
    
    const content = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = URL.createObjectURL(content);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${fontName}-fonts.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading fonts:', error);
    throw new Error('Failed to download font files');
  }
};

// Helper function to extract WOFF2 URLs from CSS
export const extractWoff2Urls = (cssContent: string): string[] => {
  const woff2Regex = /url\((.*?\.woff2.*?)\)/g;
  const matches = [...cssContent.matchAll(woff2Regex)];
  return matches.map(match => match[1].replace(/["']/g, ''));
};