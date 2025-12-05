export declare class SecretForAnalysisDto {
    snippet: string;
    filePath: string;
    lineNumber: number;
    secretType: string;
    severity: string;
}
export declare class AnalyzeRequestDto {
    secrets: SecretForAnalysisDto[];
}
