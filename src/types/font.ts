export interface FontMetrics {
    capHeight: number;
    xHeight: number;
    baseline: number;
    lineHeight: number;
}

export interface FontPreviewSettings {
    size: number;
    weight: number;
    color: string;
    lineHeight: number;
    letterSpacing: number;
}

export interface FontVariableSettings {
    weight?: number;
    width?: number;
    slant?: number;
}

export interface FontData {
    id: string;
    url: string;
    name: string;
    cssContent: string;
    weights: string[];
    metrics: FontMetrics | null;
    error: string;
    estimatedSize: number;
    subsetText: string;
    previewSettings: FontPreviewSettings;
    variableFont: boolean;
    variableSettings: FontVariableSettings;
}
