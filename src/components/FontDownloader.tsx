"use client"

import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, X, FileDown, Code, FileCode, ChevronDown, Eclipse, HelpCircle, Sparkles } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast"
import { cn } from '@/lib/utils';
import { FontPreview } from './font/FontPreview';
import { useFontProcessor } from '@/hooks/useFontProcessor';
import { PREVIEW_TEMPLATES } from '@/constants/font';
import { extractWoff2Urls, downloadWoff2Files, downloadText } from '@/utils/fontUtils';
import { v4 as uuidv4 } from 'uuid';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StepsGuideProps {
    font: any;
    useLocalPaths: boolean;
    setUseLocalPaths: React.Dispatch<React.SetStateAction<boolean>>;
    index: number;
}

const StepsGuide: React.FC<StepsGuideProps> = ({ font, useLocalPaths, setUseLocalPaths, index }) => {
    const { fonts, setFonts, loading, extractFontInfo } = useFontProcessor();
    const { toast } = useToast();
    const [openPreviews, setOpenPreviews] = useState<Set<string>>(new Set());

    const getLocalCSS = () => {
        if (!font.cssContent) return '';
        return useLocalPaths 
            ? font.cssContent.replace(/url\((.*?)\)/g, (p1: string) => {
            const fileName = p1.split('/').pop();
            return `url('/fonts/${fileName}')`;
              })
            : font.cssContent;
    };

    const downloadCSS = () => {
        const css = getLocalCSS(); // This will use local paths if enabled, otherwise original CSS
        const fileName = `${font.name.toLowerCase()}${useLocalPaths ? '.local' : ''}.css`;
        downloadText(fileName, css);
        toast({
            title: "CSS file downloaded",
            description: useLocalPaths 
                ? "CSS file with local paths has been downloaded" 
                : "Original CSS file has been downloaded"
        });
    };

    const downloadWOFF2 = async () => {
        try {
            const woff2Urls = extractWoff2Urls(font.cssContent);
            await downloadWoff2Files(woff2Urls, font.name.toLowerCase());
            toast({
                title: "WOFF2 files downloaded",
                description: "Font files have been downloaded as a ZIP"
            });
        } catch (error) {
            toast({
                title: "Download failed",
                description: "Failed to download WOFF2 files",
                variant: "destructive"
            });
        }
    };

    const tailwindConfig = `module.exports = {
  theme: {
    extend: {
      fontFamily: {
        '${font.name.toLowerCase()}': ['${font.name}'],
      },
    },
  },
}`;

    const cssImport = `@import url('/fonts/${font.name.toLowerCase()}.css');`;

    const togglePreview = (section: string) => {
        setOpenPreviews(prev => {
            const newPreviews = new Set(prev);
            if (newPreviews.has(section)) {
                newPreviews.delete(section);
            } else {
                newPreviews.add(section);
            }
            return newPreviews;
        });
    };

    const updateVariableFont = (index: number, settings: { weight?: number; width?: number }) => {
        const updatedFonts = [...fonts];
        if (updatedFonts[index].variableFont) {
            updatedFonts[index].variableSettings = { ...updatedFonts[index].variableSettings, ...settings };
            setFonts(updatedFonts);
        }
    };

    return (
        <div className="space-y-4 border border-blue-800 rounded-lg p-4 bg-blue-900/20">
            <h3 className="text-lg font-medium text-blue-400">Installation Steps</h3>
            <ol className="space-y-6">
                <li className="space-y-4">
                    <div className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">1</span>
                        <div className="space-y-2 flex-1">
                            <p>Configure and download the font files</p>
                            
                            {/* Settings and Preview Tabs */}
                            <Tabs defaultValue="files" className="space-y-4">
                                <TabsList>
                                    <TabsTrigger value="files">Files</TabsTrigger>
                                    <TabsTrigger value="preview">Preview</TabsTrigger>
                                    <TabsTrigger value="settings">Settings</TabsTrigger>
                                </TabsList>

                                <TabsContent value="files" className="space-y-4">
                                    <div className="space-y-4">
                                        <div className='flex gap-4'>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium">CSS Configuration</label>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setUseLocalPaths(!useLocalPaths)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded text-sm transition-all ease-in-out duration-300",
                                                            useLocalPaths ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                                                        )}
                                                        style={{ width: `${"✓ Using Local Paths".length + 2}ch` }}
                                                    >
                                                        {useLocalPaths ? '✓ Using Local Paths' : 'Use Local Paths'}
                                                    </button>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-all ease-in-out duration-300"
                                                                    onClick={downloadCSS}
                                                                >
                                                                    <FileCode size={16} />
                                                                    Download CSS File
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {useLocalPaths ? 'Download CSS with local paths' : 'Download original CSS'}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium">Font Files</label>
                                                <button
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm w-fit transition-all ease-in-out duration-300"
                                                    onClick={downloadWOFF2}
                                                >
                                                    <FileDown size={16} />
                                                    Download WOFF2 Files
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <button 
                                                onClick={() => togglePreview('css')}
                                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-all ease-in-out duration-300"
                                            >
                                                <ChevronDown className={`w-4 h-4 transition-transform ${openPreviews.has('css') ? 'rotate-180' : ''}`} />
                                                Preview CSS File
                                            </button>
                                            {openPreviews.has('css') && (
                                                <div className="relative">
                                                    <pre className="mt-2 p-3 rounded text-sm bg-gray-800 max-h-[400px] overflow-auto whitespace-pre-wrap break-all">
                                                        {getLocalCSS()}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="preview" className="space-y-4">
                                    <FontPreview
                                        font={font}
                                        index={0}
                                        previewText={font.subsetText}
                                        setPreviewText={() => {}}
                                        setFonts={() => {}}
                                        fonts={[font]}
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
                                        <pre className={"p-2 rounded text-xs overflow-x-auto"}>
                                            {font.subsetText}
                                        </pre>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </li>

                <li className="space-y-2">
                    <div className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">2</span>
                        <div className="space-y-2 flex-1">
                            <p>Add to your Tailwind config</p>
                            <button
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-all ease-in-out duration-300"
                                onClick={() => {
                                    navigator.clipboard.writeText(tailwindConfig);
                                    toast({ title: "Copied to clipboard" });
                                }}
                            >
                                <Code size={16} />
                                Copy Tailwind Config
                            </button>
                            <div className='space-y-2'>
                                <button 
                                    onClick={() => togglePreview('tailwind')}
                                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-all ease-in-out duration-300"
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${openPreviews.has('tailwind') ? 'rotate-180' : ''}`} />
                                    Preview Config
                                </button>
                                {openPreviews.has('tailwind') && (
                                    <pre className="mt-2 p-3 rounded text-sm bg-gray-800 overflow-x-auto">
                                        {tailwindConfig}
                                    </pre>
                                )}
                            </div>
                        </div>
                    </div>
                </li>

                <li className="space-y-2">
                    <div className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">3</span>
                        <div className="space-y-2 flex-1">
                            <p>Import the CSS in your main CSS file</p>
                            <button
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-all ease-in-out duration-300"
                                onClick={() => {
                                    navigator.clipboard.writeText(cssImport);
                                    toast({ title: "Copied to clipboard" });
                                }}
                            >
                                <FileCode size={16} />
                                Copy CSS Import
                            </button>
                            <div className='space-y-2'>
                                <button 
                                    onClick={() => togglePreview('import')}
                                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-all ease-in-out duration-300"
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${openPreviews.has('import') ? 'rotate-180' : ''}`} />
                                    Preview Import
                                </button>
                                {openPreviews.has('import') && (
                                    <pre className="mt-2 p-3 rounded text-sm bg-gray-800 overflow-x-auto">
                                        {cssImport}
                                    </pre>
                                )}
                            </div>
                        </div>
                    </div>
                </li>
            </ol>
        </div>
    );
};

const FontDownloader = () => {
    const { fonts, setFonts, loading, extractFontInfo } = useFontProcessor();
    const [previewText, setPreviewText] = useState(PREVIEW_TEMPLATES.pangram);
    const [useLocalPaths, setUseLocalPaths] = useState(false);
    const [lastFocusedIndex, setLastFocusedIndex] = useState<number>(0);

    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    const addFont = () => {
        setFonts([...fonts, {
            id: uuidv4(),
            url: '',
            name: '',
            cssContent: '',
            weights: [],
            metrics: null,
            error: '',
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (fonts[lastFocusedIndex] && fonts[lastFocusedIndex].url && !loading) {
            extractFontInfo(fonts[lastFocusedIndex].url, lastFocusedIndex);
        }
    };

    const googleFontsHelp = (
        <div className="space-y-2 max-w-sm bg-black/90 p-4 rounded-lg border border-gray-800">
            <p className="text-white">To get a Google Fonts URL:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                <li>Go to fonts.google.com</li>
                <li>Select your desired font and click on it</li>
                <li>Click "Get embed code"</li>
                <li>Go to the "Embed code in the &lt;head&gt; of your html" section</li>
                <li>Copy the <code className="bg-blue-900/50 px-1 rounded">&lt;link&gt;</code> tag's href URL</li>
            </ol>
        </div>
    );

    return (
        <div className="bg-black p-2 sm:p-6 space-y-6">
            <Card className="bg-black text-white border-none">
                <CardHeader className="flex flex-row justify-between items-center py-0">
                    <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold">
                        <div className="relative flex items-center justify-center w-8 h-8">
                            <Eclipse strokeWidth={1.5} className="w-8 h-8 bg-transparent text-cyan-500" />
                            {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent rounded-lg" /> */}
                        </div>
                        <span className="cursor-pointer bg-gradient-to-r bg-clip-text text-transparent from-cyan-500 to-50% to-blue-500 transition-all duration-300 ease-in-out">
                            LocalFont
                        </span>
                    </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6 p-3 sm:p-6">
                    <details className="group">
                        <summary className="text-xl font-bold cursor-pointer list-none flex items-center gap-2">
                            <div className="transition-transform group-open:rotate-90">▶</div>
                            How does this work?
                        </summary>
                        <div className="mt-4 space-y-4 pl-6">
                            <div className="space-y-2">
                                <h3 className="text-blue-400 font-medium">Overview</h3>
                                <p className="text-gray-300">
                                    I usually self host my fonts. However, downloading WOFF2 files found from a Google Font's CSS file hidden in a link is a cumbersome task. LocalFont helps you with this process, saving you some time.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-blue-400 font-medium">Steps to Use</h3>
                                <ol className="list-decimal list-inside space-y-3 text-sm">
                                    <li className="text-gray-300">
                                        <span className="font-medium">Get Font URL</span>
                                        <p className="ml-5 mt-1 text-gray-400">Visit fonts.google.com, choose your font, and copy the font URL from the embed code</p>
                                    </li>
                                    <li className="text-gray-300">
                                        <span className="font-medium">Process the Font</span>
                                        <p className="ml-5 mt-1 text-gray-400">Paste the URL and click Process. LocalFont will fetch both the CSS file and the font files</p>
                                    </li>
                                    <li className="text-gray-300">
                                        <span className="font-medium">Download & Setup</span>
                                        <p className="ml-5 mt-1 text-gray-400">Download the WOFF2 files and CSS with local paths, set up the TailwindCSS config and you are ready to go</p>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </details>
                    <div className="grid gap-6">
                        {fonts.map((font, index) => (
                            <div key={index} className="space-y-4 border-b border-gray-800 pb-4 last:border-b-0 animate-fadeIn">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="flex-1">
                                        <label className="text-xl font-medium mb-1 text-gray-300 flex items-center gap-2">
                                            {font.name || "Add a font"}
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger>
                                                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-300 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="right" sideOffset={5} className='bg-black p-0 m-2'>
                                                    {googleFontsHelp}
                                                </TooltipContent>
                                            </Tooltip>
                                        </label>
                                        <form onSubmit={handleSubmit}>
                                            <input
                                                type="text"
                                                className="w-full p-2 rounded bg-black border border-gray-700 text-sm focus:outline-2 focus:outline-blue-500 focus:border-transparent"
                                                placeholder="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
                                                value={font.url}
                                                onChange={(e) => {
                                                    const updatedFonts = [...fonts];
                                                    updatedFonts[index].url = e.target.value;
                                                    setFonts(updatedFonts);
                                                }}
                                                onFocus={() => setLastFocusedIndex(index)}
                                            />
                                            <button type="submit" className="hidden" />
                                        </form>
                                    </div>
                                    <div className="flex gap-2 sm:self-end">
                                        <button
                                            className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-in-out disabled:opacity-50"
                                            onClick={() => extractFontInfo(font.url, index)}
                                            disabled={loading}
                                        >
                                            <Sparkles size={16} />
                                            <span>Process</span>
                                    </button>
                                        {fonts.length > 1 && (
                                            <button
                                                className="p-2 text-red-400 rounded hover:bg-red-900/30 transition-all duration-300 ease-in-out"
                                                onClick={() => removeFont(index)}
                                                aria-label="Remove font"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {font.error && (
                                    <Alert variant="destructive" className="text-sm bg-red-300 border-none">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{font.error}</AlertDescription>
                                    </Alert>
                                )}

                                {font.cssContent && (
                                    <>
                                        <StepsGuide 
                                            font={font}
                                            useLocalPaths={useLocalPaths}
                                            setUseLocalPaths={setUseLocalPaths}
                                            index={index}
                                        />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-all duration-300 ease-in-out text-sm font-medium transform hover:translate-x-1"
                        onClick={addFont}
                    >
                        <Plus size={16} />
                        Add Another Font
                    </button>
                </CardContent>
            </Card>
        </div>
    );
};

export default FontDownloader;