export class SecretForAnalysisDto {
    snippet: string;
    filePath: string;
    lineNumber: number;
    secretType: string;
    severity: string;
}

export class AnalyzeRequestDto {
    secrets: SecretForAnalysisDto[];
}
