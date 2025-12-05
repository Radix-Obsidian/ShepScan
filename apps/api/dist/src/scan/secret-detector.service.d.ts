export interface DetectedSecret {
    filePath: string;
    lineNumber: number;
    secretType: string;
    secretName: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    snippet: string;
    matchedPattern: string;
}
export interface ScanResult {
    repoUrl: string;
    scannedAt: Date;
    totalFiles: number;
    totalSecrets: number;
    secrets: DetectedSecret[];
    scanDurationMs: number;
}
export declare class SecretDetectorService {
    private readonly logger;
    scanDirectory(dirPath: string, repoUrl: string): Promise<ScanResult>;
    private getFilesToScan;
    private scanFile;
    private createRedactedSnippet;
    calculateOverallSeverity(secrets: DetectedSecret[]): string;
}
