import { Injectable, Logger } from '@nestjs/common';
import {
    SECRET_PATTERNS,
    SKIP_EXTENSIONS,
    SKIP_DIRECTORIES,
    MAX_FILE_SIZE,
    SecretPattern,
} from './secret-patterns';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface DetectedSecret {
    filePath: string;
    lineNumber: number;
    secretType: string;
    secretName: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    snippet: string; // Redacted snippet showing context
    matchedPattern: string; // The pattern name that matched
}

export interface ScanResult {
    repoUrl: string;
    scannedAt: Date;
    totalFiles: number;
    totalSecrets: number;
    secrets: DetectedSecret[];
    scanDurationMs: number;
}

@Injectable()
export class SecretDetectorService {
    private readonly logger = new Logger(SecretDetectorService.name);

    /**
     * Scan a directory for secrets
     */
    async scanDirectory(dirPath: string, repoUrl: string): Promise<ScanResult> {
        const startTime = Date.now();
        const secrets: DetectedSecret[] = [];
        let totalFiles = 0;

        const files = await this.getFilesToScan(dirPath);
        totalFiles = files.length;

        this.logger.log(`Scanning ${totalFiles} files in ${dirPath}`);

        for (const file of files) {
            try {
                const fileSecrets = await this.scanFile(file, dirPath);
                secrets.push(...fileSecrets);
            } catch (error) {
                this.logger.warn(`Failed to scan file ${file}: ${error.message}`);
            }
        }

        const scanDurationMs = Date.now() - startTime;

        this.logger.log(
            `Scan complete: ${secrets.length} secrets found in ${totalFiles} files (${scanDurationMs}ms)`,
        );

        return {
            repoUrl,
            scannedAt: new Date(),
            totalFiles,
            totalSecrets: secrets.length,
            secrets,
            scanDurationMs,
        };
    }

    /**
     * Recursively get all files to scan
     */
    private async getFilesToScan(dirPath: string): Promise<string[]> {
        const files: string[] = [];

        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                if (!SKIP_DIRECTORIES.has(entry.name)) {
                    const subFiles = await this.getFilesToScan(fullPath);
                    files.push(...subFiles);
                }
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (!SKIP_EXTENSIONS.has(ext)) {
                    // Check file size
                    try {
                        const stats = await fs.stat(fullPath);
                        if (stats.size <= MAX_FILE_SIZE) {
                            files.push(fullPath);
                        }
                    } catch {
                        // Skip files we can't stat
                    }
                }
            }
        }

        return files;
    }

    /**
     * Scan a single file for secrets
     */
    private async scanFile(
        filePath: string,
        basePath: string,
    ): Promise<DetectedSecret[]> {
        const secrets: DetectedSecret[] = [];

        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        const relativePath = path.relative(basePath, filePath);

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const lineNumber = lineIndex + 1;

            for (const pattern of SECRET_PATTERNS) {
                // Reset regex lastIndex for global patterns
                pattern.regex.lastIndex = 0;

                let match: RegExpExecArray | null;
                while ((match = pattern.regex.exec(line)) !== null) {
                    // Create redacted snippet
                    const snippet = this.createRedactedSnippet(line, match[0]);

                    // Avoid duplicate detections on same line for same pattern
                    const isDuplicate = secrets.some(
                        (s) =>
                            s.filePath === relativePath &&
                            s.lineNumber === lineNumber &&
                            s.secretType === pattern.type,
                    );

                    if (!isDuplicate) {
                        secrets.push({
                            filePath: relativePath,
                            lineNumber,
                            secretType: pattern.type,
                            secretName: pattern.name,
                            severity: pattern.severity,
                            description: pattern.description,
                            snippet,
                            matchedPattern: pattern.name,
                        });
                    }
                }
            }
        }

        return secrets;
    }

    /**
     * Create a redacted snippet showing context but hiding the secret
     */
    private createRedactedSnippet(line: string, secret: string): string {
        const maxLength = 100;
        let redactedLine = line;

        // Redact the secret, keeping first and last 2 chars if long enough
        if (secret.length > 8) {
            const redacted = `${secret.slice(0, 2)}${'*'.repeat(Math.min(secret.length - 4, 20))}${secret.slice(-2)}`;
            redactedLine = line.replace(secret, redacted);
        } else {
            redactedLine = line.replace(secret, '*'.repeat(secret.length));
        }

        // Trim if too long
        if (redactedLine.length > maxLength) {
            redactedLine = redactedLine.slice(0, maxLength) + '...';
        }

        return redactedLine.trim();
    }

    /**
     * Calculate overall severity for a scan result
     */
    calculateOverallSeverity(secrets: DetectedSecret[]): string {
        if (secrets.some((s) => s.severity === 'critical')) return 'critical';
        if (secrets.some((s) => s.severity === 'high')) return 'high';
        if (secrets.some((s) => s.severity === 'medium')) return 'medium';
        if (secrets.some((s) => s.severity === 'low')) return 'low';
        return 'none';
    }
}
