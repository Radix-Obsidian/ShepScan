export declare class ScanRequestDto {
    repoUrl: string;
    userId?: string;
}
export declare class DetectedSecretDto {
    filePath: string;
    lineNumber: number;
    secretType: string;
    secretName: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    snippet: string;
    matchedPattern: string;
}
export declare class ScanResponseDto {
    success: boolean;
    repoUrl: string;
    repoName: string;
    scannedAt: string;
    scanDurationMs: number;
    totalFiles: number;
    totalSecrets: number;
    overallSeverity: string;
    secrets: DetectedSecretDto[];
    error?: string;
}
