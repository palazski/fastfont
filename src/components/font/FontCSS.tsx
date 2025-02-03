import { Copy, Download, FileDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { FontData } from '@/types/font';
import { downloadWoff2Files, extractWoff2Urls } from '@/utils/fontUtils';

interface FontCSSProps {
  font: FontData;
  index: number;
  isDarkMode: boolean;
  toggleBase64: (index: number) => Promise<void>;
  useLocalPaths: boolean;
  setUseLocalPaths: (value: boolean) => void;  // Add this line
}

export const FontCSS = ({ 
  font, 
  index, 
  isDarkMode, 
  toggleBase64, 
  useLocalPaths,
  setUseLocalPaths  // Add this parameter
}: FontCSSProps) => {
  const { toast } = useToast();

  const getCssContent = () => {
    if (font.base64Enabled) return font.base64Content;
    
    if (useLocalPaths) {
      return font.cssContent.replace(
        /url\((https:\/\/fonts\.gstatic\.com\/.*?)\)/g,
        (match, url) => {
          const fileName = url.split('/').pop();
          return `url("/fonts/${font.name}/${fileName}")`;
        }
      );
    }
    
    return font.cssContent;
  };

  const downloadCssFile = () => {
    const content = getCssContent();
    const blob = new Blob([content], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${font.name.toLowerCase()}.css`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "CSS file has been downloaded",
    });
  };

  const handleDownloadFonts = async () => {
    try {
      const woff2Urls = extractWoff2Urls(font.cssContent);
      if (woff2Urls.length === 0) {
        throw new Error('No WOFF2 files found in the CSS');
      }
      await downloadWoff2Files(woff2Urls, font.name);
      toast({
        title: "Success",
        description: "Font files have been downloaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download fonts",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={font.base64Enabled}
              onCheckedChange={() => toggleBase64(index)}
            />
            <span className="text-sm">Use Base64 Encoding</span>
          </div>
          {!font.base64Enabled && (
            <div className="flex items-center gap-2">
              <Switch
                checked={useLocalPaths}
                onCheckedChange={setUseLocalPaths}
              />
              <span className="text-sm">Use Local Paths</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadCssFile}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <FileDown size={16} />
            Download CSS
          </button>
          <button
            onClick={handleDownloadFonts}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Download size={16} />
            Download WOFF2
          </button>
        </div>
      </div>

      <div className="relative">
        <pre className={cn(
          "p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto",
          isDarkMode ? "bg-gray-700" : "bg-gray-100"
        )}>
          {getCssContent()}
        </pre>
        <button
          className="absolute top-2 right-2 p-2 bg-white rounded shadow hover:bg-gray-50 transition-colors dark:bg-gray-600 dark:hover:bg-gray-500"
          onClick={() => {
            navigator.clipboard.writeText(getCssContent());
            toast({
              title: "Copied to clipboard",
              description: "CSS has been copied to your clipboard",
            });
          }}
          aria-label="Copy CSS"
        >
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
};
