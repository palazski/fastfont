"use client"

import React, { useState, useEffect } from 'react';
import { AlertCircle, Download, Copy, Plus, X, Sun, Moon, Grid, List } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast"
import { cn } from '@/lib/utils';
import { FontPreview } from './font/FontPreview';
import { FontCSS } from './font/FontCSS';
import { useFontProcessor } from '@/hooks/useFontProcessor';
import { PREVIEW_TEMPLATES } from '@/constants/font';
import { generateSubsetRange } from '@/utils/fontUtils';

const FontDownloader = () => {
  const { fonts, setFonts, loading, extractFontInfo } = useFontProcessor();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [previewText, setPreviewText] = useState(PREVIEW_TEMPLATES.pangram);
  const [tailwindConfig, setTailwindConfig] = useState('');
  const { toast } = useToast();
  const [useLocalPaths, setUseLocalPaths] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addFont = () => {
    setFonts([...fonts, {
      id: Date.now().toString(),
      url: '',
      name: '',
      cssContent: '',
      weights: [],
      metrics: null,
      error: '',
      base64Enabled: false,
      base64Content: '',
      estimatedSize: 0,
      subsetText: previewText,
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

  const removeFont = (index: number) => {
    if (fonts.length > 1) {
      const updatedFonts = fonts.filter((_, i) => i !== index);
      setFonts(updatedFonts);
    }
  };

  const updateVariableFont = (index: number, settings: { weight?: number; width?: number }) => {
    const updatedFonts = [...fonts];
    if (updatedFonts[index].variableFont) {
      updatedFonts[index].variableSettings = { ...updatedFonts[index].variableSettings, ...settings };
      setFonts(updatedFonts);
    }
  };

  const toggleBase64 = async (index: number) => {
    // ... existing toggleBase64 implementation ...
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-6 space-y-6">
      <Card className={cn("shadow-lg", isDarkMode ? "dark bg-gray-800 text-white" : "")}>
        <CardHeader className="border-b flex flex-row justify-between items-center">
          <CardTitle className="text-xl sm:text-2xl">LocalFont</CardTitle>
          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              aria-label="Toggle view mode"
            >
              {viewMode === 'list' ? <Grid size={20} /> : <List size={20} />}
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-3 sm:p-6">
          <div className="grid gap-6">
            {fonts.map((font, index) => (
              <div key={index} className="space-y-4 border-b pb-4 last:border-b-0">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Google Fonts CSS URL
                    </label>
                    <input
                      type="text"
                      className={cn(
                        "w-full p-2 border rounded text-sm",
                        isDarkMode ? "bg-gray-700 border-gray-600" : ""
                      )}
                      placeholder="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
                      value={font.url}
                      onChange={(e) => {
                        const updatedFonts = [...fonts];
                        updatedFonts[index].url = e.target.value;
                        setFonts(updatedFonts);
                      }}
                    />
                  </div>
                  <div className="flex gap-2 sm:self-end">
                    <button
                      className={cn(
                        "flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors",
                        loading && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => extractFontInfo(font.url, index)}
                      disabled={loading}
                    >
                      <Download size={16} />
                      <span>Process</span>
                    </button>
                    {fonts.length > 1 && (
                      <button
                        className="p-2 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                        onClick={() => removeFont(index)}
                        aria-label="Remove font"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {font.error && (
                  <Alert variant="destructive" className="text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{font.error}</AlertDescription>
                  </Alert>
                )}

                {font.cssContent && (
                  <Tabs defaultValue="code" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="code">Font Code</TabsTrigger>
                      <TabsTrigger value="preview">Visual Preview</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="code" className="space-y-4">
                      <FontCSS
                        font={font}
                        index={index}
                        isDarkMode={isDarkMode}
                        toggleBase64={toggleBase64}
                        useLocalPaths={useLocalPaths}
                        setUseLocalPaths={setUseLocalPaths}  // Add this line
                      />
                    </TabsContent>

                    <TabsContent value="preview" className="space-y-4">
                      <FontPreview
                        font={font}
                        index={index}
                        previewText={previewText}
                        setPreviewText={setPreviewText}
                        isDarkMode={isDarkMode}
                        setFonts={setFonts}
                        fonts={fonts}
                      />
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                      {font.variableFont && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Weight</label>
                            <Slider
                              min={100}
                              max={900}
                              step={1}
                              value={[font.variableSettings.weight || 400]}
                              onValueChange={([value]) => updateVariableFont(index, { weight: value })}
                            />
                          </div>
                          {font.variableSettings.width !== undefined && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Width</label>
                              <Slider
                                min={50}
                                max={150}
                                step={1}
                                value={[font.variableSettings.width]}
                                onValueChange={([value]) => updateVariableFont(index, { width: value })}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Estimated Size</label>
                        <p className="text-sm">{font.estimatedSize} KB</p>
                      </div>
                      {font.metrics && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Metrics</label>
                          {/* Continuing from the Metrics section */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Cap Height: {Math.round(font.metrics.capHeight)}px</div>
                            <div>x-Height: {Math.round(font.metrics.xHeight)}px</div>
                            <div>Baseline: {Math.round(font.metrics.baseline)}px</div>
                            <div>Line Height: {Math.round(font.metrics.lineHeight)}px</div>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subset Range</label>
                        <pre className={cn(
                          "p-2 rounded text-xs overflow-x-auto",
                          isDarkMode ? "bg-gray-700" : "bg-gray-100"
                        )}>
                          {generateSubsetRange(previewText)}
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            ))}
          </div>

          <button
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors text-sm font-medium"
            onClick={addFont}
          >
            <Plus size={16} />
            Add Another Font
          </button>

          {tailwindConfig && (
            <div>
              <h3 className="text-lg font-medium mb-2">Tailwind Config</h3>
              <div className="relative">
                <pre className={cn(
                  "p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap break-all",
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                )}>
                  {tailwindConfig}
                </pre>
                <button
                  className="absolute top-2 right-2 p-2 bg-white rounded shadow hover:bg-gray-50 transition-colors dark:bg-gray-600 dark:hover:bg-gray-500"
                  onClick={() => {
                    navigator.clipboard.writeText(tailwindConfig);
                    toast({
                      title: "Copied to clipboard",
                      description: "Tailwind config has been copied to your clipboard",
                    });
                  }}
                  aria-label="Copy config"
                >
                  <Copy size={16} />
                </button>
              </div>
              {fonts.map(f => f.name && (
                <code key={f.id} className="bg-blue-100 dark:bg-blue-800 px-1 rounded mx-1">
                  font-{f.name.toLowerCase()}
                </code>
              ))}
            </div>
          )}

          <div className="space-y-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
            <h3 className="text-lg font-medium">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Create a <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">fonts</code> directory in your public folder</li>
              <li>Download the WOFF2 files and place them in the fonts directory</li>
              <li>Add the CSS to your global styles file</li>
              <li>Update your Tailwind config with the provided configuration</li>
              <li>
                Use the fonts in your components with: 
                {fonts.map(f => f.name && (
                  <code key={f.name} className="bg-blue-100 dark:bg-blue-800 px-1 rounded mx-1">
                    font-{f.name.toLowerCase()}
                  </code>
                ))}
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FontDownloader;