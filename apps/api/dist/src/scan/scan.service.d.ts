import { SecretDetectorService, DetectedSecret } from './secret-detector.service';
import { GitService } from './git.service';
import { PrismaService } from '../prisma/prisma.service';
export interface ScanRequestDto {
    repoUrl: string;
    userId?: string;
}
export interface ScanResponse {
    success: boolean;
    repoUrl: string;
    repoName: string;
    scannedAt: string;
    scanDurationMs: number;
    totalFiles: number;
    totalSecrets: number;
    overallSeverity: string;
    secrets: DetectedSecret[];
    error?: string;
}
export declare class ScanService {
    private readonly secretDetector;
    private readonly gitService;
    private readonly prisma;
    private readonly logger;
    constructor(secretDetector: SecretDetectorService, gitService: GitService, prisma: PrismaService);
    scanRepository(request: ScanRequestDto): Promise<ScanResponse>;
    private persistScanResults;
    getScanHistory(userId: string): Promise<{
        id: string;
        name: string;
        url: string;
        scannedAt: Date;
        secretCount: number;
        overallSeverity: string;
    }[]>;
}
