import { FontData } from '@/types/font';

interface FontPreviewProps {
    font: FontData;
    index: number;
    previewText: string;
    setFonts: (fonts: FontData[]) => void;
    fonts: FontData[];
    setPreviewText: (text: string) => void;
}

export const FontPreview = ({
    font,
    index,
    previewText,
    setFonts,
    fonts,
    setPreviewText
}: FontPreviewProps) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Controls Section */}
                <div className="space-y-4">
                    {/* Preview Text Input */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Preview Text</label>
                        <textarea
                            className="w-full p-2 border rounded text-sm min-h-[100px] bg-gray-700 border-gray-600"
                            value={previewText}
                            onChange={(e) => setPreviewText(e.target.value)}
                            placeholder="Type something..."
                        />
                    </div>
                    
                    {/* Font Controls */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Size Control */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Font Size (px)</label>
                            <input
                                type="number"
                                min="8"
                                max="120"
                                className="w-full p-2 border rounded text-sm bg-gray-700 border-gray-600"
                                value={font.previewSettings.size}
                                onChange={(e) => {
                                    const updatedFonts = [...fonts];
                                    updatedFonts[index].previewSettings.size = Number(e.target.value);
                                    setFonts(updatedFonts);
                                }}
                            />
                        </div>

                    {/* Color Control */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={font.previewSettings.color}
                                    onChange={(e) => {
                                    const updatedFonts = [...fonts];
                                    updatedFonts[index].previewSettings.color = e.target.value;
                                    setFonts(updatedFonts);
                                    }}
                                    className="w-8 h-8 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={font.previewSettings.color}
                                    onChange={(e) => {
                                    const updatedFonts = [...fonts];
                                    updatedFonts[index].previewSettings.color = e.target.value;
                                    setFonts(updatedFonts);
                                    }}
                                    className="flex-1 p-2 border rounded text-sm bg-gray-700 border-gray-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Font Weight and Letter Spacing Controls */}
                    <div className="grid grid-cols-2 gap-4">
                    {/* Weight Control */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Font Weight</label>
                        <input
                        type="range"
                        min="100"
                        max="900"
                        step="100"
                        className="w-full"
                        value={font.previewSettings.weight}
                        onChange={(e) => {
                            const updatedFonts = [...fonts];
                            updatedFonts[index].previewSettings.weight = Number(e.target.value);
                            setFonts(updatedFonts);
                        }}
                        />
                        <div className="text-sm text-center mt-1">{font.previewSettings.weight}</div>
                    </div>

                    {/* Letter Spacing Control */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Letter Spacing (px)</label>
                        <input
                        type="range"
                        min="-2"
                        max="10"
                        step="0.5"
                        className="w-full"
                        value={font.previewSettings.letterSpacing}
                        onChange={(e) => {
                            const updatedFonts = [...fonts];
                            updatedFonts[index].previewSettings.letterSpacing = Number(e.target.value);
                            setFonts(updatedFonts);
                        }}
                        />
                        <div className="text-sm text-center mt-1">{font.previewSettings.letterSpacing}px</div>
                    </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div>
                    <label className="block text-sm font-medium mb-2">Preview</label>
                    <div className="p-4 border rounded min-h-[200px] border-gray-600"
                        style={{
                            fontFamily: font.name,
                            fontSize: `${font.previewSettings.size}px`,
                            fontWeight: font.previewSettings.weight,
                            color: font.previewSettings.color,
                            letterSpacing: `${font.previewSettings.letterSpacing}px`,
                            lineHeight: font.previewSettings.lineHeight,
                        }}
                        >
                        {previewText}
                    </div>
                </div>
            </div>
        </div>
    );
};
