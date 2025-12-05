export class ScanRequestDto {
    repoUrl: string;
    userId?: string;
}

export class DetectedSecretDto {
    filePath: string;
    lineNumber: number;
    secretType: string;
    secretName: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    snippet: string;
    matchedPattern: string;
}

export class ScanResponseDto {
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
