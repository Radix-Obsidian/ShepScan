import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SecretDetectorService, ScanResult, DetectedSecret } from './secret-detector.service';
import { GitService } from './git.service';
import { PrismaService } from '../prisma/prisma.service';

export interface ScanRequestDto {
    repoUrl: string;
    userId?: string; // Optional - for anonymous scans
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

@Injectable()
export class ScanService {
    private readonly logger = new Logger(ScanService.name);

    constructor(
        private readonly secretDetector: SecretDetectorService,
        private readonly gitService: GitService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Scan a repository by URL
     * This is the main entry point for manual scans
     */
    async scanRepository(request: ScanRequestDto): Promise<ScanResponse> {
        const { repoUrl } = request;

        // Validate URL
        const parsed = this.gitService.parseGitHubUrl(repoUrl);
        if (!parsed) {
            throw new BadRequestException(
                'Invalid GitHub URL. Please provide a valid GitHub repository URL.',
            );
        }

        const repoName = `${parsed.owner}/${parsed.repo}`;
        this.logger.log(`Starting scan for ${repoName}`);

        // Clone the repository
        const cloneResult = await this.gitService.cloneRepo(repoUrl);

        if (!cloneResult.success) {
            return {
                success: false,
                repoUrl,
                repoName,
                scannedAt: new Date().toISOString(),
                scanDurationMs: 0,
                totalFiles: 0,
                totalSecrets: 0,
                overallSeverity: 'none',
                secrets: [],
                error: cloneResult.error,
            };
        }

        try {
            // Scan the repository
            const scanResult = await this.secretDetector.scanDirectory(
                cloneResult.localPath,
                repoUrl,
            );

            const overallSeverity = this.secretDetector.calculateOverallSeverity(
                scanResult.secrets,
            );

            // Optionally persist to database if user is authenticated
            if (request.userId) {
                await this.persistScanResults(request.userId, repoUrl, repoName, scanResult);
            }

            return {
                success: true,
                repoUrl,
                repoName,
                scannedAt: scanResult.scannedAt.toISOString(),
                scanDurationMs: scanResult.scanDurationMs,
                totalFiles: scanResult.totalFiles,
                totalSecrets: scanResult.totalSecrets,
                overallSeverity,
                secrets: scanResult.secrets,
            };
        } finally {
            // Always cleanup cloned repo
            await this.gitService.cleanup(cloneResult.localPath);
        }
    }

    /**
     * Persist scan results to database
     */
    private async persistScanResults(
        userId: string,
        repoUrl: string,
        repoName: string,
        scanResult: ScanResult,
    ): Promise<void> {
        try {
            // Create or find repo
            let repo = await this.prisma.repo.findFirst({
                where: { url: repoUrl, userId },
            });

            if (!repo) {
                repo = await this.prisma.repo.create({
                    data: {
                        provider: 'github',
                        name: repoName,
                        url: repoUrl,
                        user: { connect: { id: userId } },
                    },
                });
            }

            // Store detected secrets
            for (const secret of scanResult.secrets) {
                await this.prisma.secret.create({
                    data: {
                        repoId: repo.id,
                        filePath: secret.filePath,
                        lineNumber: secret.lineNumber,
                        secretType: secret.secretType,
                        severity: secret.severity,
                        aiExplanation: secret.description,
                    },
                });
            }

            this.logger.log(`Persisted ${scanResult.secrets.length} secrets for ${repoName}`);
        } catch (error) {
            this.logger.error(`Failed to persist scan results: ${error.message}`);
            // Don't throw - persistence failure shouldn't break the scan response
        }
    }

    /**
     * Get scan history for a user
     */
    async getScanHistory(userId: string) {
        const repos = await this.prisma.repo.findMany({
            where: { userId },
            include: {
                secrets: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return repos.map((repo) => ({
            id: repo.id,
            name: repo.name,
            url: repo.url,
            scannedAt: repo.createdAt,
            secretCount: repo.secrets.length,
            overallSeverity: this.secretDetector.calculateOverallSeverity(
                repo.secrets.map((s) => ({
                    ...s,
                    secretName: s.secretType,
                    description: s.aiExplanation || '',
                    snippet: '',
                    matchedPattern: s.secretType,
                })) as DetectedSecret[],
            ),
        }));
    }
}
