"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ScanService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanService = void 0;
const common_1 = require("@nestjs/common");
const secret_detector_service_1 = require("./secret-detector.service");
const git_service_1 = require("./git.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ScanService = ScanService_1 = class ScanService {
    secretDetector;
    gitService;
    prisma;
    logger = new common_1.Logger(ScanService_1.name);
    constructor(secretDetector, gitService, prisma) {
        this.secretDetector = secretDetector;
        this.gitService = gitService;
        this.prisma = prisma;
    }
    async scanRepository(request) {
        const { repoUrl } = request;
        const parsed = this.gitService.parseGitHubUrl(repoUrl);
        if (!parsed) {
            throw new common_1.BadRequestException('Invalid GitHub URL. Please provide a valid GitHub repository URL.');
        }
        const repoName = `${parsed.owner}/${parsed.repo}`;
        this.logger.log(`Starting scan for ${repoName}`);
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
            const scanResult = await this.secretDetector.scanDirectory(cloneResult.localPath, repoUrl);
            const overallSeverity = this.secretDetector.calculateOverallSeverity(scanResult.secrets);
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
        }
        finally {
            await this.gitService.cleanup(cloneResult.localPath);
        }
    }
    async persistScanResults(userId, repoUrl, repoName, scanResult) {
        try {
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
        }
        catch (error) {
            this.logger.error(`Failed to persist scan results: ${error.message}`);
        }
    }
    async getScanHistory(userId) {
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
            overallSeverity: this.secretDetector.calculateOverallSeverity(repo.secrets.map((s) => ({
                ...s,
                secretName: s.secretType,
                description: s.aiExplanation || '',
                snippet: '',
                matchedPattern: s.secretType,
            }))),
        }));
    }
};
exports.ScanService = ScanService;
exports.ScanService = ScanService = ScanService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [secret_detector_service_1.SecretDetectorService,
        git_service_1.GitService,
        prisma_service_1.PrismaService])
], ScanService);
//# sourceMappingURL=scan.service.js.map